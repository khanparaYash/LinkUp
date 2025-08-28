export default function Input({ label, className = "", ...props }) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full px-3 py-2 rounded-lg 
                   border border-slate-200 dark:border-slate-700 
                   bg-white dark:bg-slate-900 
                   text-slate-900 dark:text-slate-100 
                   focus:outline-none focus:ring-2 
                   focus:ring-indigo-200 dark:focus:ring-indigo-500"
      />
    </div>
  );
}
