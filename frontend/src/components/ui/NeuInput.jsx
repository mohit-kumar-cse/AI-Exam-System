// src/components/ui/NeuInput.jsx
export default function NeuInput({
  placeholder,
  type = "text",
  name,
  value,
  onChange,
  disabled = false,
  className = "",
  ...rest
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...rest}
      className={`
        w-full px-4 py-2 rounded-xl
        bg-[#0f172a]
        text-white
        placeholder-gray-400
        border border-gray-700
        shadow-inner
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-all duration-200
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    />
  );
}