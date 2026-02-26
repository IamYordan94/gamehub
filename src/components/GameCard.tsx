import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type GameCardProps = {
  title: string;
  description: string;
  icon: string;
  to?: string;
  locked?: boolean;
  variant?: 'default' | 'locked';
};

export default function GameCard({
  title,
  description,
  icon,
  to,
  locked = false,
  variant = 'default',
}: GameCardProps) {
  const isLocked = locked || variant === 'locked';

  const cardContent = (
    <div className="p-5 text-left">
      <span className="text-2xl mb-2 block">{icon}</span>
      <h3 className="font-semibold text-lg text-[#f5f5f5] mb-1">{title}</h3>
      <p className="text-sm text-[#a1a1aa]">{description}</p>
    </div>
  );

  const baseClasses =
    'block w-full rounded-xl border border-[#3f3f5a] bg-[#252538] transition-all hover:border-[#3b82f6]/50 hover:bg-[#2a2a3d]';

  if (isLocked) {
    return (
      <Link to="/coming-soon">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${baseClasses} opacity-80`}
        >
          {cardContent}
          <div className="px-5 pb-4 text-xs text-[#a1a1aa]">Coming soon</div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={to!}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={baseClasses}
      >
        {cardContent}
      </motion.div>
    </Link>
  );
}
