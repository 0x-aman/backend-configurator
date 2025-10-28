"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Zap, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductShowcase() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "Lightning Fast",
      description:
        "Experience blazing-fast performance with our optimized infrastructure.",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Enterprise Security",
      description: "Bank-level security to keep your data safe and protected.",
      icon: Shield,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Scale Effortlessly",
      description:
        "Grow your business without worrying about infrastructure limits.",
      icon: Rocket,
      color: "from-orange-500 to-red-500",
    },
  ];

  const CurrentIcon = features[currentFeature].icon;

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Feature Icon */}
        <div
          className={`mb-8 inline-flex p-6 rounded-2xl bg-gradient-to-br ${features[currentFeature].color} shadow-lg`}
        >
          <CurrentIcon className="w-12 h-12 text-white" />
        </div>

        {/* Feature Title */}
        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
          {features[currentFeature].title}
        </h2>

        {/* Feature Description */}
        <p className="text-lg text-slate-300 mb-12 leading-relaxed">
          {features[currentFeature].description}
        </p>

        {/* Feature Counter */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={prevFeature}
            className="border-slate-600 hover:bg-slate-700 bg-transparent text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentFeature
                    ? "bg-white w-8"
                    : "bg-slate-600 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextFeature}
            className="border-slate-600 hover:bg-slate-700 bg-transparent text-slate-300 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* CTA */}
        <p className="text-sm text-slate-400 font-medium">
          {currentFeature + 1} of {features.length}
        </p>
      </div>
    </div>
  );
}
