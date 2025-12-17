import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



const NewsletterSection = ({ showNotification }) => {
  const [email, setEmail] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Валидация email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Подписка на рассылку через API
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Сброс предыдущих ошибок
    setError(null);
    setValidationErrors({});
    
    // Клиентская валидация
    if (!email.trim()) {
      setError('Пожалуйста, введите email');
      showNotification('Пожалуйста, введите email', 'danger');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Введите корректный email адрес');
      showNotification('Введите корректный email адрес', 'danger');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('https://pets.сделай.site/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      if (response.status === 204) {
        // Успешная подписка (No Content)
        setSubscriptionSuccess(true);
        setEmail('');
        showNotification('Спасибо за подписку! Вы будете получать уведомления о новых найденных животных.', 'success');
      } else if (response.status === 422) {
        // Ошибка валидации
        const errorData = await response.json();
        
        if (errorData.error && errorData.error.errors) {
          setValidationErrors(errorData.error.errors);
          
          // Показываем первую ошибку
          const firstErrorKey = Object.keys(errorData.error.errors)[0];
          const firstErrorMessage = errorData.error.errors[firstErrorKey]?.[0];
          
          if (firstErrorMessage) {
            setError(firstErrorMessage);
            showNotification(firstErrorMessage, 'danger');
          } else {
            setError('Ошибка валидации данных');
            showNotification('Ошибка валидации данных', 'danger');
          }
        } else if (errorData.message) {
          setError(errorData.message);
          showNotification(errorData.message, 'danger');
        } else {
          setError('Ошибка при валидации данных');
          showNotification('Ошибка при валидации данных', 'danger');
        }
      } else {
        // Другие ошибки
        let errorMessage = `Ошибка сервера: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // Если ответ не в JSON формате
          const textError = await response.text();
          if (textError) {
            errorMessage = textError;
          }
        }
        
        setError(errorMessage);
        showNotification(errorMessage, 'danger');
      }
    } catch (error) {
      console.error('Ошибка сети при подписке:', error);
      setError('Ошибка сети. Пожалуйста, проверьте соединение.');
      showNotification('Ошибка сети. Пожалуйста, проверьте соединение.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Сброс формы
  const handleReset = () => {
    setSubscriptionSuccess(false);
    setEmail('');
    setError(null);
    setValidationErrors({});
  };

  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <h2 className="text-center section-title mb-4">Подпишитесь на новости</h2>
            <p className="text-center mb-4">
              Получайте уведомления о новых найденных животных в вашем районе. 
              Мы будем отправлять только важную информацию о найденных питомцах.
            </p>
            
            {subscriptionSuccess ? (
              <div className="text-center">
                <div className="alert alert-success">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="bi bi-check-circle-fill fs-3 me-3 text-success"></i>
                    <div>
                      <h5 className="alert-heading">Вы успешно подписались!</h5>
                      <p className="mb-0">
                        На email <strong>{email}</strong> будут приходить уведомления о новых найденных животных.
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={handleReset}
                >
                  <i className="bi bi-envelope-plus me-2"></i>
                  Подписать другой email
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert alert-danger mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                <form id="subscription-form" onSubmit={handleSubscribe} noValidate>
                  <div className="mb-3">
                    <label htmlFor="subscription-email" className="form-label">
                      Email адрес <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="email" 
                      id="subscription-email" 
                      className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                      placeholder="Ваш email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Очищаем ошибку при вводе
                        if (validationErrors.email || error) {
                          setValidationErrors({});
                          setError(null);
                        }
                      }}
                      disabled={isLoading}
                      required
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback">
                        {validationErrors.email[0]}
                      </div>
                    )}

                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary btn-lg" 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Отправка...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-envelope-check me-2"></i>
                          Подписаться на новости
                        </>
                      )}
                    </button>
                  </div>

                </form>
                

              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const PetsCardsSection = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных с API
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://pets.сделай.site/api/pets');
        
        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Согласно API, данные находятся в data.data.orders
        if (data.data && Array.isArray(data.data.orders)) {
          // Сортируем по дате (по убыванию - самые новые первыми)
          const sortedPets = [...data.data.orders].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // По убыванию
          });
          
          // Берем только первые 6 записей (самые новые)
          setPets(sortedPets.slice(0, 6));
        } else {
          setPets([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке карточек животных:', error);
        setError('Не удалось загрузить информацию о животных');
        setPets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Функция для получения полного URL изображения
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placebear.com/g/500/400';
    
    // Если путь уже полный URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Если путь относительный, добавляем базовый URL
    if (imagePath.startsWith('/')) {
      return `https://pets.сделай.site${imagePath}`;
    }
    
    return `https://pets.сделай.site/${imagePath}`;
  };

  // Функция форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Ошибка форматирования даты:', dateString, error);
      return dateString;
    }
  };

  // Переход к деталям животного
  const handlePetDetails = (petId) => {
    navigate(`/pet/${petId}`);
  };

  // Маскирование телефона (если требуется)
  const maskPhone = (phone) => {
    if (!phone) return 'Не указан';
    // Оставляем последние 4 цифры, остальное заменяем на *
    return phone.replace(/(\d{4})$/, '****$1');
  };

  if (isLoading) {
    return (
      <section className="py-5">
        <div className="container">
          <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-3">Загружаем информацию о найденных животных...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <div className="container">
          <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
          <div className="alert alert-warning text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (pets.length === 0) {
    return (
      <section className="py-5">
        <div className="container">
          <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
          <div className="alert alert-info text-center">
            <i className="bi bi-info-circle me-2"></i>
            На данный момент нет животных, ищущих хозяев
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center section-title">Животные, ищущие хозяев</h2>
        <p className="text-center mb-4">Последние найденные животные</p>
        
        <div className="row" id="home-pets-container">
          {pets.map(pet => (
            <div key={pet.id} className="col-md-6 col-lg-4 mb-4 fade-in">
              <div className="card h-100 pet-card">
                <div className="position-relative">
                  <img loading="lazy"
                    src={getImageUrl(pet.photo)} 
                    className="card-img-top" 
                    alt={pet.kind}
                    onError={(e) => {
                      e.target.src = 'https://placebear.com/g/500/400';
                      e.target.onerror = null;
                    }}
                    style={{ height: '250px', objectFit: 'cover' }}
                  />
                  {pet.registred && (
                    <span className="badge bg-success position-absolute top-0 end-0 m-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Зарегистрировано
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{pet.kind}</h5>
                  <p className="card-text">
                    {pet.description && pet.description.length > 100 
                      ? `${pet.description.substring(0, 100)}...` 
                      : pet.description || 'Описание отсутствует'}
                  </p>
                  
                  <div className="pet-feature">
                    <i className="bi bi-tag"></i>
                    <span><strong>Тип животного:</strong> {pet.kind}</span>
                  </div>
                  
                  {pet.mark && pet.mark.trim() && (
                    <div className="pet-feature">
                      <i className="bi bi-upc-scan"></i>
                      <span><strong>Номер чипа/марки:</strong> {pet.mark}</span>
                    </div>
                  )}
                  
                  <div className="pet-feature">
                    <i className="bi bi-person"></i>
                    <span><strong>Нашедший:</strong> {pet.name}</span>
                  </div>
                  
                  <div className="pet-feature">
                    <i className="bi bi-geo-alt"></i>
                    <span><strong>Район:</strong> {pet.district}</span>
                  </div>
                  
                  <div className="pet-feature">
                    <i className="bi bi-calendar"></i>
                    <span><strong>Дата находки:</strong> {formatDate(pet.date)}</span>
                  </div>

                  {pet.phone && (
                    <div className="pet-feature">
                      <i className="bi bi-telephone"></i>
                      <span><strong>Телефон:</strong> {maskPhone(pet.phone)}</span>
                    </div>
                  )}

                  <button 
                    className="btn btn-outline-primary w-100 btn-animate mt-3" 
                    onClick={() => handlePetDetails(pet.id)}
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SliderSection = () => {
  const [sliderPets, setSliderPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderError, setSliderError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Загрузка данных для слайдера с сервера
  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        setIsLoading(true);
        setSliderError(null);
        
        const response = await fetch('https://pets.сделай.site/api/pets/slider');
        
        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data.pets)) {
          setSliderPets(data.data.pets);
        } else {
          setSliderPets([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке слайдера:', error);
        setSliderError('Не удалось загрузить истории успеха');
        setSliderPets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSliderData();
  }, []);

  // Функции для слайдера
  const nextSlide = () => {
    if (sliderPets.length > 0) {
      setCurrentSlide(prev => prev < sliderPets.length - 1 ? prev + 1 : 0);
    }
  };

  const prevSlide = () => {
    if (sliderPets.length > 0) {
      setCurrentSlide(prev => prev > 0 ? prev - 1 : sliderPets.length - 1);
    }
  };

  // Функция для получения полного URL изображения
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `https://pets.сделай.site${imagePath}`;
    }
    
    return `https://pets.сделай.site/${imagePath}`;
  };

  // Функция форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  if (!isLoading && sliderPets.length === 0) {
    return null;
  }

  return (
    <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <h2 className="text-center section-title">Животные, у которых были найдены хозяева</h2>
        
        {isLoading ? (
          <div className="slider-preloader text-center py-5">
            <div className="spinner-border text-success" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-3">Загружаем истории успешных возвращений...</p>
          </div>
        ) : sliderError ? (
          <div className="alert alert-warning text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {sliderError}
          </div>
        ) : (
          <div className="slider-container" style={{ 
            borderRadius: '15px', 
            overflow: 'hidden', 
            height: '500px',
            position: 'relative'
          }}>
            <div className="slider-track" style={{ 
              transform: `translateX(-${currentSlide * 100}%)`,
              display: 'flex',
              height: '100%'
            }}>
              {sliderPets.map((pet, index) => (
                <div 
                  key={pet.id} 
                  className="slider-item"
                  style={{
                    minWidth: '100%',
                    position: 'relative',
                    height: '100%'
                  }}
                >
                  {/* Фоновое изображение без затемнения */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${getImageUrl(pet.image)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                  
                  {/* Текстовый блок внизу */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '25px 40px',
                      borderTopLeftRadius: '15px',
                      borderTopRightRadius: '15px',
                      boxShadow: '0 -5px 20px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h3 className="mb-2" style={{ color: '#2f4f4f', fontSize: '1.8rem' }}>
                          {pet.kind}
                        </h3>
                        
                        <p className="mb-3" style={{ color: '#495057', fontSize: '1.1rem' }}>
                          {pet.description}
                        </p>
                        
                        {/* Дополнительная информация */}
                        <div className="row">
                          {pet.name && (
                            <div className="col-auto mb-2">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person me-2" style={{ color: '#28a745' }}></i>
                                <span style={{ color: '#6c757d' }}>
                                  <strong>Нашедший:</strong> {pet.name}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {pet.district && (
                            <div className="col-auto mb-2">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-geo-alt me-2" style={{ color: '#28a745' }}></i>
                                <span style={{ color: '#6c757d' }}>
                                  <strong>Район:</strong> {pet.district}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {pet.date && (
                            <div className="col-auto mb-2">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-calendar me-2" style={{ color: '#28a745' }}></i>
                                <span style={{ color: '#6c757d' }}>
                                  <strong>Дата:</strong> {formatDate(pet.date)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-md-4 text-end">
                        {/* Бейдж "Хозяин найден" */}
                        <div className="d-inline-block">
                          <span className="badge bg-success p-3" style={{ 
                            fontSize: '1.1rem',
                            borderRadius: '10px'
                          }}>
                            <i className="bi bi-check-circle-fill me-2"></i>
                            Хозяин найден!
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {sliderPets.length > 1 && (
              <>
                {/* Кнопки навигации */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '20px',
                  right: '20px',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  zIndex: 10
                }}>
                  <button 
                    onClick={prevSlide}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#28a745',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(40, 167, 69, 0.9)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.color = '#28a745';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <i className="bi bi-chevron-left" style={{ fontSize: '1.5rem' }}></i>
                  </button>
                  
                  <button 
                    onClick={nextSlide}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#28a745',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(40, 167, 69, 0.9)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.color = '#28a745';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <i className="bi bi-chevron-right" style={{ fontSize: '1.5rem' }}></i>
                  </button>
                </div>
                
                {/* Индикаторы слайдов */}
                <div style={{
                  position: 'absolute',
                  bottom: '160px', // Выше текстового блока
                  left: '0',
                  right: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  zIndex: 10
                }}>
                  {sliderPets.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Перейти к слайду ${index + 1}`}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '2px solid white',
                        background: index === currentSlide ? '#28a745' : 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#28a745';
                        e.currentTarget.style.transform = 'scale(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        if (index !== currentSlide) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                        }
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const Home = ({ showNotification }) => {
  return (
    <div className="home-page">

      <SliderSection />
      <PetsCardsSection />
      <NewsletterSection showNotification={showNotification} />
    </div>
  );
};

export default Home;