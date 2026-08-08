import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { stepperVariants, pulseVariants, successCheckVariants } from '../animations/variants';

const AnimatedStepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={index} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <motion.div
                  variants={stepperVariants}
                  initial="inactive"
                  animate={
                    isCompleted ? 'completed' : isCurrent ? 'active' : 'inactive'
                  }
                  className={`
                    relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-success' : isCurrent ? 'bg-secondary' : 'bg-border dark:bg-foregroundDark'}
                    transition-colors duration-300
                  `}
                >
                  {isCompleted ? (
                    <motion.div
                      variants={successCheckVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Check className="text-white" size={24} />
                    </motion.div>
                  ) : (
                    <span
                      className={`
                        text-sm font-bold
                        ${isCurrent ? 'text-white' : 'text-foregroundSecondary dark:text-foregroundSecondaryDark'}
                      `}
                    >
                      {index + 1}
                    </span>
                  )}

                  {/* Pulse effect for current step */}
                  {isCurrent && (
                    <motion.div
                      variants={pulseVariants}
                      animate="pulse"
                      className="absolute inset-0 rounded-full bg-primary opacity-30"
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    mt-2 text-xs text-center max-w-[100px]
                    ${isCurrent ? 'text-foreground dark:text-secondaryDark font-semibold' : 'text-foregroundSecondary dark:text-foregroundSecondary'}
                  `}
                >
                  {step}
                </motion.p>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5 bg-border dark:bg-foregroundDark">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{
                      width: index < currentStep ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full bg-success"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedStepper;
