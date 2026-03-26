export default function TestPage() {
	return (
		<div className="flex flex-col gap-8 pb-12">
			{/* 환영 배너 */}
			<section className="rounded-2xl bg-primary/10 p-8 text-center md:p-12 md:text-left">
				<h2 className="text-2xl font-bold text-primary md:text-3xl mb-2">
					헤더 스크롤 테스트 페이지 🎉
				</h2>
				<p className="text-muted">
					마우스를 아래로 스크롤하여 상단 헤더가 어떻게 변하는지 확인해 보세요.
				</p>
			</section>

			{/* 헤더의 블러 효과를 잘 보기 위한 알록달록한 더미 카드들 */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{/* 임의로 12개의 카드를 반복 생성하여 스크롤 유도 */}
				{Array.from({ length: 12 }).map((_, index) => (
					<div
						key={index}
						className="flex h-48 flex-col justify-between rounded-xl border border-border bg-paper p-6 shadow-sm"
					>
						<div className="space-y-3">
							{/* 스켈레톤 UI 느낌의 더미 콘텐츠 */}
							<div className="h-6 w-1/2 rounded-md bg-primary/20" />
							<div className="h-4 w-3/4 rounded-md bg-muted/20" />
							<div className="h-4 w-full rounded-md bg-muted/10" />
						</div>
						<div className="flex items-center justify-between">
							<div className="h-4 w-1/3 rounded-md bg-muted/20" />
							<div className="size-8 rounded-full bg-accent" />
						</div>
					</div>
				))}
			</div>

			{/* 최하단 섹션 */}
			<section className="mt-8 rounded-2xl bg-accent/30 p-12 text-center">
				<h3 className="text-xl font-bold text-ink">끝까지 내려왔습니다!</h3>
				<p className="text-muted mt-2">
					지금 상단에 떠 있는 헤더 뒤로 콘텐츠가 은은하게 비치고 있다면
					성공입니다.
				</p>
			</section>
		</div>
	);
}
