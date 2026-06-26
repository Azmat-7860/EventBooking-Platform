export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-bgPrimary py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-textMuted">
            &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_BRAND_NAME || "EventPro"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
