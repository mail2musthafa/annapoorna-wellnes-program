import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-sage-900 text-sand-100 border-t border-sage-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-annapoorna-500 flex items-center justify-center text-white font-serif font-bold text-lg">
                अ
              </div>
              <span className="font-serif text-2xl font-bold text-sand-50">Annapoorna</span>
            </div>
            <p className="text-sm text-sand-300 leading-relaxed">
              Empowering lifelong vitality through whole plant nourishment, restorative rhythms, and supportive community circles.
            </p>
          </div>

          {/* Six Pillars */}
          <div>
            <h4 className="font-serif font-semibold text-sand-50 mb-4 text-base">The Six Pillars</h4>
            <ul className="space-y-2.5 text-sm text-sand-300">
              <li><Link href="/pillars#nutrition" className="hover:text-annapoorna-400 transition-colors">1. Nutrition</Link></li>
              <li><Link href="/pillars#movement" className="hover:text-annapoorna-400 transition-colors">2. Movement</Link></li>
              <li><Link href="/pillars#restorative-sleep" className="hover:text-annapoorna-400 transition-colors">3. Restorative Sleep</Link></li>
              <li><Link href="/pillars#mindfulness" className="hover:text-annapoorna-400 transition-colors">4. Mindfulness</Link></li>
              <li><Link href="/pillars#relationships-community" className="hover:text-annapoorna-400 transition-colors">5. Relationships & Community</Link></li>
              <li><Link href="/pillars#avoidance-of-risky-substances" className="hover:text-annapoorna-400 transition-colors">6. Clean Living Habits</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-sand-50 mb-4 text-base">Resources</h4>
            <ul className="space-y-2.5 text-sm text-sand-300">
              <li><Link href="/recipes" className="hover:text-annapoorna-400 transition-colors">Culinary Medicine</Link></li>
              <li><Link href="/lead-guide" className="hover:text-annapoorna-400 transition-colors">Free Wellness Guide</Link></li>
              <li><Link href="/dashboard" className="hover:text-annapoorna-400 transition-colors">Member Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-annapoorna-400 transition-colors">Portal Login</Link></li>
            </ul>
          </div>

          {/* Trust & Medical Disclaimer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-annapoorna-400 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Evidence-Informed Wellness</span>
            </div>
            <p className="text-xs text-sand-400 leading-relaxed">
              Information provided on Annapoorna Portal is strictly for educational wellness purposes and does not constitute medical diagnosis, treatment, or clinical advice.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sage-800 text-xs text-sand-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Annapoorna Portal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
