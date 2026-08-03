function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
        className="
          h-12
          w-full
          rounded-lg
          border
          border-slate-300
          bg-white
          px-4
          text-sm
          text-slate-900
          placeholder:text-slate-400
          outline-none
          transition-all
          duration-200

          hover:border-slate-400

          focus:border-blue-600
          focus:ring-4
          focus:ring-blue-100

          disabled:bg-slate-100
          disabled:text-slate-400
          disabled:cursor-not-allowed
        "
      />
    </div>
  );
}

export default Input;