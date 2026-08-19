// src/components/common/PageHeader.jsx
export default function PageHeader({ heading, sub }) {
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{heading}</h1>
      {sub && <p className="text-sm sm:text-base text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}