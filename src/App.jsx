import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, PlusCircle, MapPin, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react';

// --- CONFIGURATION ---
const supabaseUrl = 'YOUR_SUPABASE_URL'; 
const supabaseKey = 'sb_publishable_eHVPjc0Qt6r7Gw5wTdDNdA_XX1rqVLv';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'Lost', title: '', location: '', date: '', description: '' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    let result = items;
    if (filterType !== 'All') result = result.filter(i => i.type === filterType);
    if (searchTerm) result = result.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredItems(result);
  }, [searchTerm, filterType, items]);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase.from('items').select('*').order('id', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = null;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData } = await supabase.storage.from('item-images').upload(fileName, imageFile);
      if (uploadData) {
        const { data } = supabase.storage.from('item-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    await supabase.from('items').insert([{ ...form, image_url: imageUrl }]);
    setForm({ type: 'Lost', title: '', location: '', date: '', description: '' });
    setImageFile(null);
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-10 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">REUNITE.ai</h1>
          <div className="relative w-full max-w-xs ml-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search items..." 
              className="pl-10 pr-4 py-2 w-full rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <PlusCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Report New Item</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                {['Lost', 'Found'].map(t => (
                  <button 
                    key={t} type="button"
                    onClick={() => setForm({...form, type: t})}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${form.type === t ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
                  > {t} </button>
                ))}
              </div>

              <input required placeholder="Item Title" name="title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <ImageIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <span className="text-xs text-slate-500 block">{imageFile ? imageFile.name : 'Click to upload photo'}</span>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <input required placeholder="Location" name="location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              <input required type="date" name="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              <textarea required placeholder="Details (Color, brand, markings...)" name="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" rows="3" />
              
              <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Post to Bulletin'}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Lost', 'Found'].map(t => (
              <button 
                key={t} onClick={() => setFilterType(t)}
                className={`px-6 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${filterType === t ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              > {t} </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img src={item.image_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Item" />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${item.type === 'Lost' ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-emerald-500 shadow-lg shadow-emerald-200'}`}>
                    {item.type}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2 h-10">{item.description}</p>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-20 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No matches found. Try a different search!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
