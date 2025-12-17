import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Встроенный кастомный хук useDebounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const QuickSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Используем встроенный хук useDebounce с задержкой 1000ms
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // Эффект для выполнения поиска при изменении debounced значения
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length > 3) {
        await fetchSuggestions(debouncedSearchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Функция для получения подсказок с сервера и группировки по описаниям
  const fetchSuggestions = async (query) => {
    try {
      setIsLoading(true);
      setShowSuggestions(true);
      
      const response = await fetch(`https://pets.сделай.site/api/search?query=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data.orders) && data.data.orders.length > 0) {
          // Группируем объявления по описанию
          const groupedByDescription = data.data.orders.reduce((groups, order) => {
            if (!order.description) return groups;
            
            const normalizedDesc = order.description.trim().toLowerCase();
            if (!groups[normalizedDesc]) {
              groups[normalizedDesc] = {
                description: order.description,
                count: 0,
                exampleId: order.id, // сохраняем один ID для примера
                fullDescription: order.description, // сохраняем оригинальное описание
                orders: [] // сохраняем все объявления с этим описанием
              };
            }
            groups[normalizedDesc].count++;
            groups[normalizedDesc].orders.push(order);
            return groups;
          }, {});
          
          // Преобразуем объект в массив и сортируем по количеству объявлений
          const groupedArray = Object.values(groupedByDescription)
            .sort((a, b) => b.count - a.count) // сортируем по убыванию количества
            .slice(0, 5); // ограничиваем 5 результатами
          
          setSuggestions(groupedArray);
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Ошибка при получении подсказок:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Функция для обработки поиска по всему запросу
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Используем searchQuery как параметр description для поисковой страницы
      navigate(`/search?description=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  // Обработчик нажатия Enter в поле поиска
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Обработчик клика по подсказке (описанию)
  const handleSuggestionClick = (suggestion) => {
    // Переходим на страницу поиска с фильтром по этому описанию
    if (suggestion.fullDescription || suggestion.description) {
      const description = suggestion.fullDescription || suggestion.description;
      navigate(`/search?description=${encodeURIComponent(description)}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  // Обработчик клика по одиночному объявлению (если description уникален)
  const handleSinglePetClick = (order) => {
    navigate(`/pet/${order.id}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  // Закрытие подсказок при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Функция для выделения совпадающего текста
  const highlightMatch = (text, query) => {
    if (!text || !query) return text || '';
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return (text || '').replace(regex, '<mark>$1</mark>');
  };

  // Функция для отображения подсказки (описание и количество объявлений)
  const renderSuggestion = (suggestion, index) => {
    // Если только одно объявление с таким описанием, показываем как одиночное
    if (suggestion.count === 1 && suggestion.orders && suggestion.orders[0]) {
      const order = suggestion.orders[0];
      return (
        <div
          key={index}
          className="p-3 border-bottom hover-bg-light cursor-pointer"
          onClick={() => handleSinglePetClick(order)}
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.classList.add('bg-light')}
          onMouseLeave={(e) => e.currentTarget.classList.remove('bg-light')}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              {/* Описание животного с подсветкой */}
              {suggestion.description && (
                <div className="mb-1">
                  <span dangerouslySetInnerHTML={{ 
                    __html: highlightMatch(suggestion.description, searchQuery) 
                  }} />
                </div>
              )}
              {/* Дополнительная информация о животном */}
              {order.kind && (
                <div className="text-muted small">
                  <i className="bi bi-tag me-1"></i>
                  {order.kind}
                  {order.district && (
                    <>
                      <i className="bi bi-geo-alt ms-2 me-1"></i>
                      {order.district}
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Бейдж для одиночного объявления */}
            <span className="badge bg-secondary ms-2">
              1 объявление
            </span>
          </div>
          
          {/* Вспомогательный текст */}
          <div className="text-muted small mt-1">
            <i className="bi bi-info-circle me-1"></i>
            Нажмите, чтобы посмотреть это объявление
          </div>
        </div>
      );
    }
    
    // Если несколько объявлений с таким описанием
    return (
      <div
        key={index}
        className="p-3 border-bottom hover-bg-light cursor-pointer"
        onClick={() => handleSuggestionClick(suggestion)}
        style={{ cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.classList.add('bg-light')}
        onMouseLeave={(e) => e.currentTarget.classList.remove('bg-light')}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            {/* Описание животного с подсветкой */}
            {suggestion.description && (
              <div className="mb-1">
                <span dangerouslySetInnerHTML={{ 
                  __html: highlightMatch(suggestion.description, searchQuery) 
                }} />
              </div>
            )}
            
            {/* Примеры животных из этой группы */}
            {suggestion.orders && suggestion.orders.slice(0, 2).map((order, i) => (
              <div key={i} className="text-muted small">
                <i className="bi bi-circle-fill me-1" style={{ fontSize: '6px' }}></i>
                {order.kind || 'Животное'}
                {order.district && ` • ${order.district}`}
              </div>
            ))}
            
            {suggestion.count > 2 && (
              <div className="text-muted small">
                <i className="bi bi-three-dots me-1"></i>
                и ещё {suggestion.count - 2} объявлений
              </div>
            )}
          </div>
          
          {/* Бейдж с количеством объявлений */}
          <span className="badge bg-primary ms-2">
            {suggestion.count} объявлений
          </span>
        </div>
        
        {/* Вспомогательный текст */}
        <div className="text-muted small mt-1">
          <i className="bi bi-info-circle me-1"></i>
          Нажмите, чтобы посмотреть все объявления с этим описанием
        </div>
      </div>
    );
  };

  return (
    <div className="position-relative w-100">
      <form className="d-flex w-100" onSubmit={(e) => e.preventDefault()}>
        <div className="position-relative flex-grow-1 w-100">
          <input
            ref={searchInputRef}
            className="form-control w-100"
            type="search"
            placeholder="Поиск по описанию..."
            aria-label="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (suggestions.length > 0 && searchQuery.length > 3) {
                setShowSuggestions(true);
              }
            }}
            style={{ width: '100%' }}
          />
          
          {/* Сообщение о минимальной длине */}
          {searchQuery.length > 0 && searchQuery.length < 4 && !showSuggestions && (
            <div className="position-absolute end-0 top-50 translate-middle-y me-3">
              <small className="text-muted">Введите минимум 4 символа</small>
            </div>
          )}
          
          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="position-absolute end-0 top-50 translate-middle-y me-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          )}
        </div>
        
        <button 
          className="btn btn-success ms-2 flex-shrink-0" 
          type="button"
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
        >
          <i className="bi bi-search me-1"></i>
          Найти
        </button>
      </form>

      {/* Выпадающий список с подсказками */}
      {showSuggestions && searchQuery.length > 3 && (
        <div 
          ref={suggestionsRef}
          className="position-absolute top-100 start-0 end-0 mt-1 bg-white rounded shadow-lg border"
          style={{ 
            zIndex: 1050, 
            maxHeight: '400px',
            overflowY: 'auto',
            width: '100%'
          }}
        >
          {isLoading ? (
            <div className="p-3 text-center">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
              <span className="text-muted">Ищем совпадения...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="p-3 border-bottom bg-light">
                <small className="text-muted">
                  <i className="bi bi-lightbulb me-1"></i>
                  Найдено описаний: {suggestions.length}
                </small>
              </div>
              
              {suggestions.map(renderSuggestion)}
              
              <div className="p-3 border-top text-center bg-light">
                <small className="text-muted d-block mb-2">
                  Всего найдено {suggestions.reduce((sum, item) => sum + item.count, 0)} объявлений
                </small>
                <button 
                  className="btn btn-sm btn-success"
                  onClick={handleSearch}
                >
                  <i className="bi bi-search me-1"></i>
                  Показать все результаты
                </button>
              </div>
            </>
          ) : (
            <div className="p-3 text-center text-muted">
              <i className="bi bi-search mb-2" style={{ fontSize: '24px' }}></i>
              <p className="mb-1">Ничего не найдено по запросу "{searchQuery}"</p>
              <small className="d-block">Попробуйте изменить запрос</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickSearch;