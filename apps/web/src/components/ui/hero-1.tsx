export function HeroSection() {
	return (
		<section className="mx-auto w-full max-w-5xl">
			{/* Top radial glow */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 isolate overflow-hidden contain-strict"
			>
				<div className="absolute inset-0 -top-14 isolate -z-10 bg-[radial-gradient(35%_80%_at_49%_0%,--theme(--color-primary/.18),transparent)] contain-strict" />
			</div>

			<div className="relative flex flex-col items-center justify-center gap-5 pt-20 pb-6 px-4">
				<div className="relative">
					<span
						aria-hidden="true"
						className="absolute inset-0 flex items-center justify-center leading-none text-foreground/[.06] font-['Hina_Mincho'] select-none text-[10rem]"
					>
						型
					</span>
					<h1 className="sr-only">dojocho</h1>
					<img
						src="/logo.png"
						alt="dojocho"
						width={400}
						height={400}
						className="relative fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out drop-shadow-[0_0_50px_oklch(0.6321_0.2554_13.98_/_0.35)] size-56 sm:size-64 md:size-72"
					/>
				</div>

			</div>
		</section>
	);
}
