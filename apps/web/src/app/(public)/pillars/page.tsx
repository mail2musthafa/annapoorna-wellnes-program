import { Apple, Activity, Moon, Heart, Users, ShieldCheck, Check } from "lucide-react";

export default function PillarsPage() {
  const pillars = [
    {
      id: "nutrition",
      name: "1. Nutrition",
      tagline: "Nourishing vitality with whole, unprocessed plant foods",
      description: "Evidence-informed nourishment focused on nutrient density, gut microbiome diversity, and metabolic harmony.",
      education: "In-depth video tutorials, macronutrient balancing guides, and metabolic science masterclasses.",
      management: "Personalized weekly meal plans, ingredient shopping lists, and hydration tracking.",
      analysis: "Log meal adherence, fiber intake, and daily energy correlations.",
      icon: Apple,
      accent: "border-emerald-200 bg-emerald-50/50",
    },
    {
      id: "movement",
      name: "2. Movement",
      tagline: "Joyful, sustainable physical activity and functional mobility",
      description: "Daily movement routines incorporating functional mobility, resistance, and cardiovascular conditioning.",
      education: "Mobility workshops, yoga alignment masterclasses, and functional strength fundamentals.",
      management: "Daily movement goals, active class bookings, and posture reminders.",
      analysis: "Weekly active minutes, step averages, and physical vigor trends.",
      icon: Activity,
      accent: "border-amber-200 bg-amber-50/50",
    },
    {
      id: "restorative-sleep",
      name: "3. Restorative Sleep",
      tagline: "Consistent circadian alignment and deep biological recovery",
      description: "Optimizing nighttime recovery through sleep hygiene, temperature regulation, and evening wind-down rituals.",
      education: "Circadian rhythm biology, blue light management, and deep sleep optimization.",
      management: "Evening wind-down alarms, digital curfew checklists, and sleep journal.",
      analysis: "Sleep quality self-ratings, duration tracking, and morning restoration scores.",
      icon: Moon,
      accent: "border-indigo-200 bg-indigo-50/50",
    },
    {
      id: "mindfulness",
      name: "4. Mindfulness",
      tagline: "Calming nervous system arousal and fostering present awareness",
      description: "Pranayama breathwork, mindfulness meditation, and emotional regulation techniques.",
      education: "Vagus nerve stimulation techniques, guided meditations, and stress physiology.",
      management: "Daily 10-minute breathwork practice, gratitude journaling, and pause reminders.",
      analysis: "Daily calm score, stress resilience self-rating, and emotional equilibrium.",
      icon: Heart,
      accent: "border-rose-200 bg-rose-50/50",
    },
    {
      id: "relationships-community",
      name: "5. Relationships & Community",
      tagline: "Cultivating empathetic connections and peer accountability",
      description: "Fostering meaningful relationships, community circles, and supportive lifestyle companionship.",
      education: "Compassionate communication, community health benefits, and boundary setting.",
      management: "Community circle participation, peer check-ins, and shared milestones.",
      analysis: "Social connection self-ratings and group participation logs.",
      icon: Users,
      accent: "border-teal-200 bg-teal-50/50",
    },
    {
      id: "avoidance-of-risky-substances",
      name: "6. Avoidance of Risky Substances",
      tagline: "Recalibrating habits and embracing non-toxic lifestyles",
      description: "Empowering sustainable lifestyle shifts away from tobacco, excess alcohol, and ultra-processed additives.",
      education: "Habit loop recalibration, cravings physiology, and holistic substitution.",
      management: "Habit replacement logs, streak counters, and positive coping triggers.",
      analysis: "Clean habit streaks, trigger tracking, and clarity ratings.",
      icon: ShieldCheck,
      accent: "border-orange-200 bg-orange-50/50",
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-annapoorna-600">Core Foundations</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-sage-900">
            The Six Pillars of Lifestyle Medicine
          </h1>
          <p className="text-lg text-sage-700 leading-relaxed font-light">
            Each pillar supports three essential capabilities: Education, Management, and Wellness Analysis to guide sustainable life transformation.
          </p>
        </div>

        <div className="space-y-12">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                id={pillar.id}
                className={`p-8 sm:p-10 rounded-3xl border ${pillar.accent} bg-white shadow-sm transition-all hover:shadow-md`}
              >
                <div className="flex flex-col lg:flex-row gap-8 lg:items-start justify-between">
                  <div className="space-y-3 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-white shadow-sm border border-sand-200">
                        <Icon className="w-6 h-6 text-sage-800" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-sage-900">{pillar.name}</h2>
                        <p className="text-xs font-semibold text-annapoorna-700">{pillar.tagline}</p>
                      </div>
                    </div>
                    <p className="text-sm text-sage-600 leading-relaxed pt-2">{pillar.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-3/5">
                    <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200/80 space-y-2">
                      <span className="text-xs font-bold text-sage-800 uppercase tracking-wider block">Education</span>
                      <p className="text-xs text-sage-600 leading-relaxed">{pillar.education}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200/80 space-y-2">
                      <span className="text-xs font-bold text-sage-800 uppercase tracking-wider block">Management</span>
                      <p className="text-xs text-sage-600 leading-relaxed">{pillar.management}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200/80 space-y-2">
                      <span className="text-xs font-bold text-sage-800 uppercase tracking-wider block">Analysis</span>
                      <p className="text-xs text-sage-600 leading-relaxed">{pillar.analysis}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
