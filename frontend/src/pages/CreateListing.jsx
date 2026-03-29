import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/listings';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const CreateListing = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    condition: 'New',
    location: '',
    imageUrl: ''
  });

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await listingsApi.getCategories();
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: res.data[0].ID }));
        }
      } catch (err) {
        toast.error('Failed to load categories');
      } finally {
        setFetchingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'categoryId' && value === 'custom') {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCategory = async () => {
    if (!customCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    setAddingCategory(true);
    try {
      const res = await listingsApi.createCategory({ name: customCategoryName.trim() });
      const newCat = { ID: res.data.id, NAME: res.data.name };
      setCategories(prev => [...prev, newCat]);
      setFormData(prev => ({ ...prev, categoryId: newCat.ID }));
      setShowCustomCategory(false);
      setCustomCategoryName('');
      toast.success('Category added!');
    } catch (err) {
      toast.error('Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };


  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.categoryId || !formData.location || !formData.condition) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('categoryId', formData.categoryId);
    data.append('condition', formData.condition);
    data.append('location', formData.location);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const res = await listingsApi.create(data);
      toast.success('Listing posted successfully!');
      navigate(`/listings/${res.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to post listing. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-premium dark:shadow-none p-10 md:p-16 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Post a Listing</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Fill in the details below to sell your item.</p>
          </div>

          {fetchingCats ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Listing Title *</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. MacBook Pro M2"
                    required
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-gray-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Price (₹) *</label>
                    <input 
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      min="0"
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Condition *</label>
                    <select 
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-gray-900 dark:text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Location *</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai, Maharashtra"
                      required
                      className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-gray-900 dark:text-white outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          toast.error('Geolocation is not supported by your browser');
                          return;
                        }
                        setIsFetchingLocation(true);
                        navigator.geolocation.getCurrentPosition(
                          async (position) => {
                            try {
                              const { latitude, longitude } = position.coords;
                              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                              const data = await res.json();
                              const city = data.address.city || data.address.town || data.address.village || data.address.state_district || 'Unknown Location';
                              const state = data.address.state || '';
                              const locString = `${city}${state ? `, ${state}` : ''}`;
                              
                              setFormData(prev => ({ ...prev, location: locString }));
                              toast.success('Location fetched successfully!');
                            } catch (err) {
                              console.error(err);
                              toast.error('Failed to get location name');
                            } finally {
                              setIsFetchingLocation(false);
                            }
                          },
                          (error) => {
                            console.error(error);
                            toast.error('Unable to retrieve your location');
                            setIsFetchingLocation(false);
                          }
                        );
                      }}
                      disabled={isFetchingLocation}
                      className="px-6 py-4 bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-light hover:bg-secondary/20 dark:hover:bg-secondary/30 font-bold rounded-2xl transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {isFetchingLocation ? 'Locating...' : 'Use My Location'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Category *</label>
                  <select
                    name="categoryId"
                    value={showCustomCategory ? 'custom' : formData.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-gray-900 dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.ID} value={cat.ID}>{cat.NAME}</option>
                    ))}
                    <option value="custom">Add Custom Category...</option>
                  </select>
                  {showCustomCategory && (
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        value={customCategoryName}
                        onChange={e => setCustomCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary text-gray-900 dark:text-white outline-none"
                        maxLength={100}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={addingCategory}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
                      >
                        {addingCategory ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Item Image (optional)</label>
                  <div className="mt-2 flex flex-col items-center">
                    {imagePreview && (
                      <div className="mb-4 relative w-full h-64 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 shadow-premium">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <label className={`w-full flex flex-col items-center px-4 py-8 bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-500 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-primary dark:hover:border-primary transition-all ${imageFile ? 'hidden' : 'flex'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold">Click to upload or drag & drop</span>
                      <span className="text-xs uppercase tracking-widest mt-1">PNG, JPG up to 10MB</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your item in detail..."
                    rows="5"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-gray-900 dark:text-white outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-black py-5 rounded-2xl shadow-xl shadow-primary/30 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Post Listing'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
