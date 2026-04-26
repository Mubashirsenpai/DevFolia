type Props = {
  className?: string;
};

export function DevFoliaLogo({ className = "" }: Props) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-500 bg-clip-text text-lg font-extrabold tracking-[0.24em] text-transparent drop-shadow-[0_0_14px_rgba(52,211,153,0.25)] sm:text-xl">
        DEVFOLIA
      </span>
    </span>
  );
}
