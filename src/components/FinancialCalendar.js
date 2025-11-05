import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, FileText, IndianRupee, Shield, User, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { format, parseISO, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'https://df51-2405-201-2032-9025-3164-ca0c-e961-1080.ngrok-free.app',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'ngrok-skip-browser-warning': '69420'
  }
});

const PolicyCard = ({ policy, isExpanded, onToggle, calendarRef }) => {
  if (!policy) return null;

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

  const handleDateClick = (date) => {
    if (calendarRef?.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date);
      
      setTimeout(() => {
        const element = document.querySelector(`[data-date="${date}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      toast.success('Navigated to selected date');
    }
  };

  const handleOpenPDF = () => {
    const pdfUrl = policy.link;
    window.open(pdfUrl, '_blank');
    toast.success('Opening policy document');
  };

  // removed unused daysLeft
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
      className="bg-gradient-to-br from-black/90 to-gray-900/90 rounded-2xl shadow-xl 
      backdrop-blur-lg border border-amber-500/20"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-amber-200">{policy.metadata.policy_type}</h3>
            <p className="text-sm text-amber-200/70 mt-1">Policy ID: {policy.metadata.policy_number}</p>
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

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm text-amber-200/70">Policy Holder</p>
              <p className="text-amber-200">{policy.metadata.policy_holder_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer hover:bg-amber-800/30 rounded-lg transition-colors p-2"
              onClick={() => handleDateClick(policy.metadata.start_date)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm text-amber-200/70">Start Date</p>
                <p className="text-amber-200">{formatDate(policy.metadata.start_date)}</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3 cursor-pointer hover:bg-amber-800/30 p-2 rounded-lg transition-colors"
              onClick={() => handleDateClick(policy.metadata.end_date)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm text-amber-200/70">End Date</p>
                <p className="text-amber-200">{formatDate(policy.metadata.end_date)}</p>
              </div>
            </motion.div>
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
                      <p className="text-sm text-amber-200/70">Coverage Amount</p>
                      <p className="text-amber-200">{formatCurrency(policy.metadata.coverage_amount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <IndianRupee className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-sm text-amber-200/70">Premium Amount</p>
                      <p className="text-amber-200">{formatCurrency(policy.metadata.premium_amount)}</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="pt-4 border-t border-amber-500/20 cursor-pointer hover:bg-amber-500/10 p-2 rounded-lg transition-colors"
                  onClick={handleOpenPDF}
                >
                  <p className="text-sm text-amber-200/70">Policy Document</p>
                  <p className="text-amber-400 truncate hover:text-amber-300">{policy.name}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-center border-t border-amber-500/20
        text-sm text-amber-300 hover:bg-amber-500/10 transition-colors"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </motion.button>
    </motion.div>
  );
};

const PolicyCarousel = ({ policies, activePolicy, setActivePolicy, calendarRef }) => {
  if (!policies || Object.keys(policies).length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto py-2 px-2">
        {Object.entries(policies).map(([key, policy]) => (
          <motion.div
            key={key}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setActivePolicy(key)}
            className={`transition-all duration-200 ${
              activePolicy === key ? 'ring-2 ring-amber-400 ring-offset-2 rounded-2xl' : ''
            }`}
          >
            <PolicyCard 
              policy={policy} 
              isExpanded={activePolicy === key}
              calendarRef={calendarRef}
              onToggle={() => setActivePolicy(activePolicy === key ? null : key)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const FinancialCalendar = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState({});
  const [activePolicy, setActivePolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/policies');
      
      if (response.data) {
        setPolicies(response.data);
        const allEvents = [];
        const eventSet = new Set();

        Object.entries(response.data).forEach(([key, policy]) => {
          if (policy.metadata) {
            const startEventId = `${policy.metadata.policy_number}-start`;
            const endEventId = `${policy.metadata.policy_number}-end`;

            if (!eventSet.has(startEventId)) {
              allEvents.push({
                title: `${policy.metadata.policy_type} Start`,
                date: policy.metadata.start_date,
                backgroundColor: '#f59e0b',
                borderColor: '#f59e0b',
                policyId: key,
                extendedProps: {
                  type: 'start',
                  policyNumber: policy.metadata.policy_number,
                },
              });
              eventSet.add(startEventId);
            }

            if (!eventSet.has(endEventId)) {
              allEvents.push({
                title: `${policy.metadata.policy_type} End`,
                date: policy.metadata.end_date,
                backgroundColor: '#dc2626',
                borderColor: '#dc2626',
                policyId: key,
                extendedProps: {
                  type: 'end',
                  policyNumber: policy.metadata.policy_number,
                },
              });
              eventSet.add(endEventId);
            }
          }
        });

        setEvents(allEvents);
      } else {
        toast.error('No policies found');
      }
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Failed to fetch policies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleEventClick = (clickInfo) => {
    const policyId = clickInfo.event.policyId;
    setActivePolicy(policyId);
    
    const policyElement = document.getElementById(`policy-${policyId}`);
    if (policyElement) {
      policyElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDateClick = (arg) => {
    try {
      if (!policies?.metadata) return;

      const clickedDate = new Date(arg.date);
      const startDate = parseISO(policies.metadata.start_date);
      const endDate = parseISO(policies.metadata.end_date);

      if (isWithinInterval(clickedDate, { start: startDate, end: endDate })) {
        toast.success(
          `Active policy period: ${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`,
          { duration: 3000 }
        );
      } else {
        toast.info('No active policy on this date');
      }
    } catch (error) {
      console.error('Error in date click handler:', error);
      toast.error('Error checking policy dates');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat')}
              className="p-2 rounded-lg bg-amber-500/20 shadow-md hover:shadow-lg transition-all"
            >
        <ArrowLeft className="w-5 h-5 text-amber-200" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-amber-200">Financial Calendar</h1>
              <p className="text-amber-200/70">Track your policy timelines and important dates</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-black/50 rounded-2xl shadow-lg p-4 border border-amber-500/20">
            {isLoading ? (
              <div className="h-[530px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
              </div>
            ) : (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                buttonText={{
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day'
                }}
                events={events}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                height="530px"
                eventDisplay="block"
                eventContent={(arg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`px-2 py-1 text-xs font-medium text-white rounded-lg shadow-sm
                      ${arg.event.extendedProps.type === 'start' ? 'bg-amber-500' : 'bg-red-500'}`}
                  >
                    <div className="font-bold truncate">{arg.event.title}</div>
                    <div className="text-[10px] opacity-80 truncate">
                      {arg.event.extendedProps.policyNumber}
                    </div>
                  </motion.div>
                )}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                dayHeaderFormat={{
                  weekday: 'short'
                }}
                views={{
                  timeGridWeek: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
                    dayHeaderFormat: { weekday: 'short' },
                    slotLabelFormat: {
                      hour: 'numeric',
                      minute: '2-digit',
                      omitZeroMinute: true,
                      meridiem: 'short'
                    }
                  },
                  timeGridDay: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                  },
                  dayGridMonth: {
                    dayHeaderFormat: { weekday: 'short' },
                    titleFormat: { year: 'numeric', month: 'long' }
                  }
                }}
                customButtons={{
                  today: {
                    text: 'Today',
                    click: () => {
                      const calendarApi = calendarRef.current.getApi();
                      calendarApi.today();
                    }
                  }
                }}
                eventClassNames="rounded-md shadow-sm"
                className="custom-calendar"
              />
            )}
          </div>

          <div className="lg:col-span-1">
            {isLoading ? (
              <div className="animate-pulse bg-black/50 rounded-2xl h-[500px] border border-amber-500/20" />
            ) : Object.keys(policies).length > 0 ? (
              <PolicyCarousel 
                policies={policies} 
                activePolicy={activePolicy}
                setActivePolicy={setActivePolicy}
                calendarRef={calendarRef}
              />
            ) : (
              <div className="bg-black/50 rounded-2xl p-6 shadow-lg border border-amber-500/20">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                  <h3 className="text-lg font-medium text-amber-200 mb-2">No Policies Found</h3>
                  <p className="text-amber-200/70">No active policies at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalendar;