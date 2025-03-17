import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, Loader2, User, Shield,IndianRupee, Calendar as CalendarIcon,Clock,FileText, Trash2, AlertCircle} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';


// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN, 
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET, 
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const api = axios.create({
  baseURL: 'https://df51-2405-201-2032-9025-3164-ca0c-e961-1080.ngrok-free.app',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'ngrok-skip-browser-warning': '69420'
  }
});

// Reusing PolicyCard component from FinancialCalendar
const PolicyCard = ({ policy, policyKey, isExpanded, onToggle, calendarRef, onDelete  }) => {
  const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  if (!policy) return null;

  const handleDeleteClick = async () => {
    // If confirmation dialog isn't shown, show it first
    if (!showDeleteConfirm) {
        setShowDeleteConfirm(true);
        return;
    }
// const policy='policy_7';
// console.log(policy);
    setIsDeleting(true);
    try {
      const response = await api.delete(`/policy/${policyKey}`);

      if (response.data.success) {
          // Show success message with policy name
          toast.success('Policy deleted successfully');
          
          // If there were any regeneration issues, show a warning
          if (response.data.data.regeneration_summary.failed_regenerations > 0) {
              toast.warning('Some policy regenerations failed. Please check the system.');
          }
          
          // Call the onDelete callback with policy ID
          if (onDelete) {
            onDelete(policyKey);
          }
      } else {
          throw new Error(response.data.message || 'Failed to delete policy');
      }
  } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete policy. Please try again.');
  } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
  }
};

  const formatDate = (dateStr) => {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateDaysLeft = (endDate) => {
    const end = parseISO(endDate);
    const today = new Date();
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const handleOpenPDF = () => {
    window.open(policy.link, '_blank');
    toast.success('Opening policy document');
  };

  const daysLeft = calculateDaysLeft(policy.metadata.end_date);
  // const isExpired = daysLeft <= 0;
  // const isExpiring = daysLeft <= 30 && daysLeft > 0;

  // const getStatusStyle = () => {
  //   if (isExpired) return 'bg-red-500/20 text-red-300';
  //   if (isExpiring) return 'bg-yellow-500/20 text-yellow-300';
  //   return 'bg-emerald-500/20 text-emerald-300';
  // };

  // const getStatusText = () => {
  //   if (isExpired) return 'Expired';
  //   if (isExpiring) return `${daysLeft} days left`;
  //   return 'Active';
  // };


  const getRenewalStatus = (endDate) => {
    const daysLeft = calculateDaysLeft(endDate);
    
    if (daysLeft <= 0) {
      return {
        label: 'Renewal Overdue',
        color: 'bg-red-400/20 text-red-300',
        icon: 'text-red-300',
        timeLeft: 'Expired'
      };
    } else if (daysLeft <= 30) {
      return {
        label: 'Renewal Soon',
        color: 'bg-yellow-400/20 text-yellow-300',
        icon: 'text-yellow-300',
        timeLeft: `${daysLeft} D left`
      };
    } else if (daysLeft > 90) {
      const monthsLeft = Math.floor(daysLeft / 30);
      return {
        label: 'Active',
        color: 'bg-emerald-400/20 text-emerald-300',
        icon: 'text-emerald-300',
        timeLeft: `${monthsLeft} M left`
      };
    }
    return {
      label: 'Active',
      color: 'bg-emerald-400/20 text-emerald-300',
      icon: 'text-emerald-300',
      timeLeft: `${daysLeft} D left`
    };
   };

  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-black/90 via-amber-900/20 to-black/90 rounded-2xl shadow-xl 
      backdrop-blur-lg border border-amber-500/20 h-[280px] transition-all duration-300"
      style={{
        height: isExpanded ? '460px' : '280px'
      }}
    >
      {/* Delete Button */}
      <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick();
                }}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 
                border border-red-500/20 hover:border-red-500/40 transition-all duration-200
                text-red-400 hover:text-red-300"
            >
                <Trash2 className="w-4 h-4" />
            </motion.button>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl z-10
                        flex items-center justify-center p-6"
                    >
                        <div className="text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                            <h3 className="text-lg font-semibold text-white">Delete Policy?</h3>
                            <p className="text-sm text-gray-300">
                                Are you sure you want to delete this policy? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white
                                    transition-colors duration-200"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white
                                    transition-colors duration-200 flex items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
      <div className="p-6 h-[calc(100%-45px)] flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-amber-200 truncate max-w-60">{policy.metadata.policy_type}</h3>
            <p className="text-sm text-amber-200/60 mt-1">Policy ID: {policy.metadata.policy_number}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
          <motion.span 
 initial={{ scale: 0.95 }}
 animate={{ scale: 1 }}
 className={`px-3 py-1 rounded-full text-sm flex items-center gap-1.5 ${getRenewalStatus(policy.metadata.end_date).color}`}
>
 <Clock className="w-3.5 h-3.5" />
 <span>{getRenewalStatus(policy.metadata.end_date).timeLeft}</span>
</motion.span>
            <motion.span 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={`px-3 py-1 flex items-center gap-2 rounded-full text-sm ${getRenewalStatus(policy.metadata.end_date).color}`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${getRenewalStatus(policy.metadata.end_date).color}`} />
              {getRenewalStatus(policy.metadata.end_date).label}
            </motion.span>
          </div>
        </div>
 
        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm text-amber-200/60">Policy Holder</p>
              <p className="text-amber-100">{policy.metadata.policy_holder_name}</p>
            </div>
          </div>
 
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm text-amber-200/60">Start Date</p>
                <p className="text-amber-100">{formatDate(policy.metadata.start_date)}</p>
              </div>
            </div>
 
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm text-amber-200/60">End Date</p>
                <p className="text-amber-100">{formatDate(policy.metadata.end_date)}</p>
              </div>
            </div>
          </div>
 
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pt-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-sm text-amber-200/60">Coverage Amount</p>
                      <p className="text-amber-100">{formatCurrency(policy.metadata.coverage_amount)}</p>
                    </div>
                  </div>
 
                  <div className="flex items-center gap-3">
                    <IndianRupee className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-sm text-amber-200/60">Premium Amount</p>
                      <p className="text-amber-100">{formatCurrency(policy.metadata.premium_amount)}</p>
                    </div>
                  </div>
                </div>
 
                <div 
                  className="pt-4 border-t border-amber-500/20 cursor-pointer hover:bg-amber-500/10 p-2 rounded-lg transition-colors"
                  onClick={handleOpenPDF}
                >
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-sm text-amber-200/60">Policy Document</p>
                      <p className="text-amber-400 truncate hover:text-amber-300">{policy.name}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
 
      <motion.button
        onClick={onToggle}
        className="w-full p-3 rounded-lg flex items-center justify-center border-t border-amber-500/20
        text-sm text-amber-300 hover:bg-amber-500/10 transition-colors"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </motion.button>
    </motion.div>
  );
 };


const MyPoliciesPage = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState({});
  const [expandedPolicies, setExpandedPolicies] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDelete = (policyNumber) => {
    setPolicies(prevPolicies => {
        const newPolicies = { ...prevPolicies };
        delete newPolicies[policyNumber];
        return newPolicies;
    });
};


  const fetchPolicies = async () => {
    try {
      const response = await api.get('/policies');
      if (response.data) {
        setPolicies(response.data);
        // toast.success('Policies loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to fetch policies');
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading policy document...');

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `policies/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const fileLink = await getDownloadURL(uploadResult.ref);

      // Send PDF info to your API
      const response = await api.post('/extract-policy', {
        pdf_name: file.name,
        pdf_link: fileLink
      });

     

      if (response.status === 200) {
        toast.dismiss(loadingToast);
        toast.success('Policy uploaded successfully');
        // Refresh policies
        await fetchPolicies();
      }
    } catch (error) {
      console.error('Error uploading policy:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to upload policy');
    } finally {
      setIsUploading(false);
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-black to-black relative overflow-hidden">
<div className="absolute inset-0">
   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-700/20 via-black to-black" />
   <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-amber-500/5 to-transparent" />
 </div>
 <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat')}
              className="p-2 rounded-lg bg-amber-500/20 shadow-md hover:shadow-lg transition-all"
              >
              <ArrowLeft className="w-5 h-5 text-amber-200 " />
            </motion.button>
            <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
            My Policies</h1>
              <p className="text-amber-100/80">Manage and view your insurance policies</p>
            </div>
          </div>

          {/* Import Button */}
          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
           className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 
       text-black rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {isUploading ? 'Uploading...' : 'Import Policy'}
          </motion.label>
        </div>

        {/* Policy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {Object.entries(policies).length > 0 ? Object.entries(policies).map(([key, policy]) => (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="transition-all duration-200"
              >
                <PolicyCard
                   key={key}
                   policy={policy}
                   policyKey={key} 
                  isExpanded={expandedPolicies.has(key)}
                  onDelete={handleDelete} 
                  onToggle={() => {
                    setExpandedPolicies(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(key)) {
                        newSet.delete(key);
                      } else {
                        newSet.add(key);
                      }
                      return newSet;
                    });
                  }}
                />
              </motion.div>
            )) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full"
              >
                <div className="bg-black rounded-2xl p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-amber-900" />
                  <h3 className="text-lg font-medium text-amber-400 mb-2">No Policies Found</h3>
                  <p className="text-amber-500">Upload a policy document to get started</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MyPoliciesPage;