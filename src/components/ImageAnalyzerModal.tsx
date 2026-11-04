import React, { useState, useRef } from 'react';
import { ExpenseCategory, Expense } from '../types';
import { 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Camera, 
  FileText, 
  ArrowRight,
  RotateCw,
  Image as ImageIcon,
  Edit2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExpenseExtracted: (expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => Promise<void> | void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Fuel',
  'Flight',
  'Public Transport',
  'Education',
  'Subscriptions',
  'Others'
];

function normalizeCategory(cat?: string): ExpenseCategory {
  if (!cat) return 'Shopping';
  const clean = cat.trim().toLowerCase();
  if (clean.includes('food') || clean.includes('grocery') || clean.includes('groceries') || clean.includes('dining') || clean.includes('restaurant') || clean.includes('cafe') || clean.includes('snack')) return 'Food';
  if (clean.includes('fuel') || clean.includes('gas') || clean.includes('petrol') || clean.includes('diesel')) return 'Fuel';
  if (clean.includes('flight') || clean.includes('airline') || clean.includes('plane')) return 'Flight';
  if (clean.includes('transport') || clean.includes('bus') || clean.includes('train') || clean.includes('metro') || clean.includes('transit') || clean.includes('subway')) return 'Public Transport';
  if (clean.includes('travel') || clean.includes('taxi') || clean.includes('cab') || clean.includes('uber') || clean.includes('ola') || clean.includes('hotel')) return 'Travel';
  if (clean.includes('shop') || clean.includes('store') || clean.includes('retail') || clean.includes('clothing') || clean.includes('electronics')) return 'Shopping';
  if (clean.includes('bill') || clean.includes('utility') || clean.includes('electric') || clean.includes('water') || clean.includes('rent')) return 'Bills';
  if (clean.includes('sub') || clean.includes('netflix') || clean.includes('spotify') || clean.includes('prime') || clean.includes('membership')) return 'Subscriptions';
  if (clean.includes('movie') || clean.includes('entertain') || clean.includes('game')) return 'Entertainment';
  if (clean.includes('edu') || clean.includes('school') || clean.includes('course') || clean.includes('book') || clean.includes('tuition')) return 'Education';
  return 'Others';
}

export const ImageAnalyzerModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onExpenseExtracted 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  // Editable Form fields (user can review & edit extracted info before saving)
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('Shopping');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [hasExtracted, setHasExtracted] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
        return;
      }
      setError(null);
      setNotice(null);
      setIsQuotaExceeded(false);
      setHasExtracted(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        // Automatically start extraction for seamless UX
        triggerAnalyze(result);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const handleLoadSampleReceipt = async () => {
    setError(null);
    setNotice(null);
    setHasExtracted(false);
    try {
      const resp = await fetch('/assets/aistudio/image_27754557.png');
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        triggerAnalyze(result);
      };
      reader.readAsDataURL(blob);
    } catch (sampleErr) {
      console.warn('Could not load sample image:', sampleErr);
    }
  };

  const triggerAnalyze = async (imageSrc: string) => {
    setAnalyzing(true);
    setError(null);
    setNotice(null);
    setIsQuotaExceeded(false);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        if (response.status === 429 || resData.errorType === 'quota_exceeded' || String(resData.error).includes('quota')) {
          setIsQuotaExceeded(true);
        }
        throw new Error(resData.error || 'Failed to analyze receipt image.');
      }

      const data = resData.data || {};
      const rawTitle = String(data.title || '').trim();
      const isPlaceholderTitle = !rawTitle || rawTitle.toLowerCase() === 'null' || rawTitle.toLowerCase() === 'none' || rawTitle.toLowerCase() === 'undefined';
      setTitle(isPlaceholderTitle ? 'Receipt Expense' : rawTitle);

      const parsedAmount = typeof data.amount === 'number' && !isNaN(data.amount) ? data.amount : parseFloat(data.amount);
      setAmount(parsedAmount > 0 ? parsedAmount : '');

      setCategory(normalizeCategory(data.category));
      setDate(data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : new Date().toISOString().split('T')[0]);
      setDescription(data.description && data.description.toLowerCase() !== 'null' ? data.description : 'Extracted from receipt photo');
      if (resData.notice) {
        setNotice(resData.notice);
      }
      setHasExtracted(true);
    } catch (err: any) {
      console.warn('Receipt analysis error:', err);
      const msg = err.message || '';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        setIsQuotaExceeded(true);
        setError('Receipt scanner is temporarily unavailable because the AI usage quota has been reached. Your image is retained above—please fill in details below.');
      } else {
        setError(msg || 'Failed to auto-extract receipt details. Please verify or enter details manually below.');
      }
      // Retain default values so manual entry is ready without blank fields
      if (!title) setTitle('Receipt Purchase');
      if (!amount) setAmount(250);
      if (!date) setDate(new Date().toISOString().split('T')[0]);
      setHasExtracted(true); // Allow immediate manual entry while looking at photo!
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveConfirmed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) {
      setError('Please provide a valid title and total amount.');
      return;
    }

    setSaving(true);
    try {
      await onExpenseExtracted({
        title,
        amount: Number(amount),
        category,
        date,
        description: description || 'Receipt expense',
      });
      handleReset();
      onClose();
    } catch (err) {
      console.error('Error saving extracted receipt:', err);
      setError('Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setHasExtracted(false);
    setError(null);
    setIsQuotaExceeded(false);
    setTitle('');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div id="image-analyzer-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Scan Receipt or Bill
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload or capture receipt photo to extract and edit details
              </p>
            </div>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3.5 pr-1 scrollbar-thin">
          {/* Status / Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-1.5">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <strong className="block font-semibold">
                    {isQuotaExceeded ? 'AI Usage Limit Reached' : 'Analysis Notice'}
                  </strong>
                  <span className="text-[11px] leading-relaxed">{error}</span>
                </div>
              </div>
            </div>
          )}

          {/* Friendly Guidance Notice Banner */}
          {notice && !error && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] leading-relaxed">{notice}</span>
            </div>
          )}

          {/* Upload / Capture Choices when No Image Selected */}
          {!selectedImage ? (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 rounded-3xl p-7 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center group"
              >
                <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                  Click to Upload Receipt File
                </p>
                <p className="text-[11px] text-slate-400">
                  Select JPG, PNG, or WEBP invoice up to 10MB
                </p>
              </div>

              {/* Camera Trigger & Sample Demo Receipt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Use Camera</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleReceipt}
                  className="py-2.5 px-3 rounded-2xl border border-purple-200 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all shadow-2xs flex items-center justify-center space-x-2 cursor-pointer"
                  title="Try analyzing a sample store receipt"
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Try Sample Receipt</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Selected Image Retained Card */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 max-h-48 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Scanned Receipt"
                  className="max-h-48 object-contain"
                />
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retake / Change Photo</span>
                </button>
              </div>

              {analyzing ? (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center space-x-2.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Gemini 3.8 Flash is extracting vendor, amounts and date...</span>
                </div>
              ) : null}

              {/* Editable Form for Extracted / Manual Information */}
              {hasExtracted && !analyzing && (
                <form onSubmit={handleSaveConfirmed} className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <Edit2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Review & Edit Extracted Details:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Edit any field before saving
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Vendor / Expense Title
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Starbucks Coffee"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Total Amount (₹)
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="any"
                        value={amount}
                        onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as ExpenseCategory)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Notes / Items Summary
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Receipt items note"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => triggerAnalyze(selectedImage)}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Re-analyze image</span>
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Confirm & Save Expense'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
