export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const baseStyles = "w-full rounded-[5px] h-[48px] text-[15px] font-medium transition-all duration-200 flex items-center justify-center";
  
  const variants = {
    primary: "bg-[#046BD2] text-white hover:bg-[#035bb3] shadow-sm hover:shadow-md",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
