export default function Button({ children, className = '', variant = 'primary', isLoading, disabled, ...props }) {
  const baseStyles = "w-full rounded-[5px] h-[48px] text-[15px] font-medium transition-all duration-200 flex items-center justify-center";
  
  const variants = {
    primary: "bg-[#046BD2] text-white hover:bg-[#035bb3] shadow-sm hover:shadow-md disabled:bg-[#7db4e8] disabled:cursor-not-allowed",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
