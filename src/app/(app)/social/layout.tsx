import SocialBottomNav from '@/components/social/SocialBottomNav'

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <SocialBottomNav />
    </>
  )
}