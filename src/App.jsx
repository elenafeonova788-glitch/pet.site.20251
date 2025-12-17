import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/pages/Home';
import Search from './components/pages/Search';
import AddPet from './components/pages/AddPet';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Profile from './components/pages/Profile';
import PetDetails from './components/pages/PetDetails';
import EditPetModal from './components/pages/EditPetModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/App.css';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [notification, setNotification] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleEditPet = (pet) => {
    setSelectedPet(pet);
    setEditModalOpen(true);
  };

  const handlePetUpdated = () => {
    showNotification('Объявление успешно обновлено!', 'success');
    setEditModalOpen(false);
    setSelectedPet(null);
  };

  return (
    <HashRouter>
      <AuthProvider>
        <div className="App">
          <Header />
          
          {notification && (
            <div className={`alert alert-${notification.type} alert-dismissible fade show m-3 position-fixed top-0 end-0`}
                 style={{zIndex: 1050, maxWidth: '400px'}}
                 role="alert">
              {notification.message}
              <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
            </div>
          )}
          
          <main>
            <Routes>
              <Route path="/" element={<Home showNotification={showNotification} />} />
              <Route path="/search" element={<Search showNotification={showNotification} />} />
              <Route path="/add-pet" element={<AddPet showNotification={showNotification} />} />
              <Route path="/login" element={<Login showNotification={showNotification} />} />
              <Route path="/register" element={<Register showNotification={showNotification} />} />
              <Route path="/profile" element={<Profile showNotification={showNotification} onEditPet={handleEditPet} />} />
              <Route path="/pet/:id" element={<PetDetails showNotification={showNotification} />} />
            </Routes>
          </main>
          
          {editModalOpen && selectedPet && (
            <EditPetModal
              pet={selectedPet}
              onClose={() => {
                setEditModalOpen(false);
                setSelectedPet(null);
              }}
              onSuccess={handlePetUpdated}
              showNotification={showNotification}
            />
          )}
          
          <Footer />
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;