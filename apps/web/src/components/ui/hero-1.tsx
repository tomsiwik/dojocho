import { cn } from "@/lib/utils";

export function HeroSection() {
	return (
		<section className="mx-auto w-full max-w-5xl">
			{/* Top radial glow */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 isolate overflow-hidden contain-strict"
			>
				<div className="absolute inset-0 -top-14 isolate -z-10 bg-[radial-gradient(35%_80%_at_49%_0%,--theme(--color-foreground/.08),transparent)] contain-strict" />
			</div>

			<div className="relative flex flex-col items-center justify-center gap-5 pt-24 pb-6 px-4">
				<div className="relative">
					<span
						aria-hidden="true"
						className="absolute inset-0 flex items-center justify-center leading-none text-foreground/[.06] font-['Hina_Mincho'] select-none text-[10rem]"
					>
						型
					</span>
					<h1
						className={cn(
							"relative fade-in slide-in-from-bottom-10 animate-in text-balance fill-mode-backwards text-center tracking-tight delay-100 duration-500 ease-out text-6xl",
							"text-shadow-[0_0px_50px_theme(--color-foreground/.2)] font-['Hina_Mincho']"
						)}
					>
						dojocho
					</h1>
				</div>

				<p className="fade-in slide-in-from-bottom-10 mx-auto max-w-md animate-in fill-mode-backwards text-center text-foreground/80 tracking-wider delay-200 duration-500 ease-out text-xl">
					Practice katas in your own ai dojo.
				</p>

				<p className="fade-in slide-in-from-bottom-10 mx-auto max-w-lg animate-in fill-mode-backwards text-center text-foreground/60 leading-relaxed delay-300 duration-500 ease-out text-base">
					Coding katas, but you're not alone. You work through each
					challenge while an AI agent follows along
					<br/><br/>It runs your
					tests, spots where you're stuck, and asks questions to nudge
					you in the right direction. Think pair programming with a
					patient mentor who knows the material but lets you do the
					typing.
				</p>
			</div>
		</section>
	);
}
