import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Clock, PieChart } from 'lucide-react';
import { pageVariants, cardVariants } from '../animations/variants';
import { loanTypesAPI, formatCurrency, calculateEMI } from '../services/api';
import useCountUp from '../hooks/useCountUp';

const EmiCalculator = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [principal, setPrincipal] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [duration, setDuration] = useState(36);
  const [emiResult, setEmiResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const animatedEMI = useCountUp(emiResult?.emi || 0, 500);
  const animatedTotal = useCountUp(emiResult?.totalPayable || 0, 500);
  const animatedInterest = useCountUp(emiResult?.interestAmount || 0, 500);
  const animatedPrincipal = useCountUp(emiResult?.principal || 0, 500);

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  useEffect(() => {
    calculateEMIResult();
  }, [principal, interestRate, duration]);

  const fetchLoanTypes = async () => {
    try {
      const response = await loanTypesAPI.getAll();
      // Safely extract array - handle both response structures
      const data = response.data?.data || response.data || [];
      const loanTypesArray = Array.isArray(data) ? data : [];
      setLoanTypes(loanTypesArray);
      if (loanTypesArray.length > 0) {
        setSelectedLoanType(loanTypesArray[0]);
        setInterestRate(loanTypesArray[0].interestRate);
      }
    } catch (error) {
      console.error('Failed to fetch loan types:', error);
      setLoanTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateEMIResult = () => {
    const emi = calculateEMI(principal, interestRate, duration);
    const totalPayable = emi * duration;
    const interestAmount = totalPayable - principal;

    setEmiResult({
      emi,
      totalPayable,
      interestAmount,
      principal,
      interestRate,
      durationMonths: duration
    });
  };

  const handleLoanTypeChange = (e) => {
    if (!Array.isArray(loanTypes) || loanTypes.length === 0) return;
    const loanType = loanTypes.find(lt => lt._id === e.target.value);
    setSelectedLoanType(loanType);
    if (loanType) {
      setInterestRate(loanType.interestRate);
    }
  };

  const handlePrincipalChange = (e) => {
    setPrincipal(parseFloat(e.target.value));
  };

  const handleDurationChange = (e) => {
    setDuration(parseInt(e.target.value));
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-border dark:bg-cardDark rounded w-1/3 mb-4" />
          <div className="h-4 bg-border dark:bg-cardDark rounded w-1/4 mb-8" />
          <div className="h-64 bg-border dark:bg-cardDark rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="container-custom py-8"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-primary to-primaryDark rounded-2xl mb-4 shadow-soft"
        >
          <Calculator className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-foregroundDark mb-4">
          EMI Calculator
        </h1>
        <p className="text-xl text-foregroundSecondary max-w-2xl mx-auto">
          Calculate your monthly EMI and plan your loan repayment with our interactive calculator
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calculator Controls */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card p-8"
        >
          <h2 className="text-2xl font-bold text-foreground dark:text-foregroundDark mb-6">Loan Parameters</h2>

          {/* Loan Type Selection */}
          <div className="mb-8">
            <label className="label mb-3">Loan Type</label>
            <select
              value={selectedLoanType?._id || ''}
              onChange={handleLoanTypeChange}
              className="input-field"
            >
              <option value="">Select loan type</option>
              {Array.isArray(loanTypes) && loanTypes.map((lt) => (
                <option key={lt._id} value={lt._id}>
                  {lt.name} ({lt.interestRate}% interest)
                </option>
              ))}
            </select>
            {selectedLoanType && (
              <p className="text-sm text-foregroundSecondary mt-2">
                Max Amount: {formatCurrency(selectedLoanType.maxAmount)} | 
                Max Duration: {selectedLoanType.maxDurationMonths} months
              </p>
            )}
          </div>

          {/* Principal Amount Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="label mb-0">Loan Amount</label>
              <span className="text-lg font-bold text-primary dark:text-primaryDark">
                {formatCurrency(principal)}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max={selectedLoanType?.maxAmount || 10000000}
              step="10000"
              value={principal}
              onChange={handlePrincipalChange}
              className="w-full h-2 bg-border dark:bg-cardDark rounded-lg appearance-none cursor-pointer primary-primary-600"
            />
            <div className="flex justify-between text-xs text-foregroundSecondary mt-1">
              <span>₹10,000</span>
              <span>{formatCurrency(selectedLoanType?.maxAmount || 10000000)}</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="label mb-0">Interest Rate (p.a.)</label>
              <span className="text-lg font-bold text-primary dark:text-primaryDark">
                {interestRate}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-border dark:bg-cardDark rounded-lg appearance-none cursor-pointer primary-primary-600"
            />
            <div className="flex justify-between text-xs text-foregroundSecondary mt-1">
              <span>5%</span>
              <span>25%</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="label mb-0">Loan Tenure</label>
              <span className="text-lg font-bold text-primary dark:text-primaryDark">
                {duration} months
              </span>
            </div>
            <input
              type="range"
              min="12"
              max={selectedLoanType?.maxDurationMonths || 360}
              step="1"
              value={duration}
              onChange={handleDurationChange}
              className="w-full h-2 bg-border dark:bg-cardDark rounded-lg appearance-none cursor-pointer primary-primary-600"
            />
            <div className="flex justify-between text-xs text-foregroundSecondary mt-1">
              <span>12 months</span>
              <span>{selectedLoanType?.maxDurationMonths || 360} months</span>
            </div>
          </div>
        </motion.div>

        {/* Results Display */}
        <div className="space-y-6">
          {/* EMI Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="card p-8 bg-gradient-to-br from-primary to-primaryDark text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Monthly EMI</h3>
            </div>
            <motion.p
              key={emiResult?.emi}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold mb-2"
            >
              {formatCurrency(animatedEMI)}
            </motion.p>
            <p className="text-white/80 text-sm">
              per month for {duration} months
            </p>
          </motion.div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={2}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-primary dark:text-primaryDarkMode" />
                <h4 className="text-sm font-semibold text-foregroundSecondary">Principal</h4>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(animatedPrincipal)}
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={3}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-success" />
                <h4 className="text-sm font-semibold text-foregroundSecondary">Total Interest</h4>
              </div>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(animatedInterest)}
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={4}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-5 w-5 text-secondary" />
                <h4 className="text-sm font-semibold text-foregroundSecondary">Total Payable</h4>
              </div>
              <p className="text-2xl font-bold text-secondary">
                {formatCurrency(animatedTotal)}
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={5}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-warning" />
                <h4 className="text-sm font-semibold text-foregroundSecondary">Tenure</h4>
              </div>
              <p className="text-2xl font-bold text-warning">
                {duration} months
              </p>
            </motion.div>
          </div>

          {/* Interest Ratio */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={6}
            className="card p-6"
          >
            <h4 className="text-sm font-semibold text-foregroundSecondary mb-4">Interest to Principal Ratio</h4>
            <div className="relative h-4 bg-border dark:bg-cardDark rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(emiResult?.interestAmount / emiResult?.totalPayable * 100) || 0}%` 
                }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-primary to-primaryHover"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-foregroundSecondary">Interest: {emiResult ? ((emiResult.interestAmount / emiResult.totalPayable) * 100).toFixed(1) : 0}%</span>
              <span className="text-foregroundSecondary">Principal: {emiResult ? ((emiResult.principal / emiResult.totalPayable) * 100).toFixed(1) : 0}%</span>
            </div>
          </motion.div>

          {/* Apply CTA */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={7}
          >
            <a
              href="/loan-types"
              className="block w-full px-6 py-4 bg-gradient-to-r from-primary to-primaryHover text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
            >
              Apply for This Loan
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmiCalculator;
