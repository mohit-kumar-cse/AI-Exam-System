export default function PageHeader({ heading, sub }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{heading}</h1>
      {sub && <p className="text-gray-600">{sub}</p>}
    </div>
  );
}
