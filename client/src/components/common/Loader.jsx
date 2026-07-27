export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16 text-taupe">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-taupe border-t-gold mr-3" />
      <span>{label}</span>
    </div>
  );
}
