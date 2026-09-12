export type Project = { slug: string; name: string; type: string; year: string; url: string; description: string; accent: string; accent2: string; role: string; tags: string[] };

export const projects: Project[] = [
  { slug: "natural-health-group", name: "Natural Health Group", type: "Healthcare website", year: "2026", url: "https://naturalhealthgrp.vercel.app/", description: "A calm, credibility-led web presence for a health-focused organization.", accent: "#7ef2dc", accent2: "#236861", role: "UI design · Frontend", tags: ["Website", "Responsive", "Conversion"] },
  { slug: "petbuds", name: "PetBuds", type: "Consumer platform", year: "2025", url: "https://petbuds.co.uk/", description: "A friendly digital experience designed to make a complex pet-service journey feel simple.", accent: "#ffb683", accent2: "#b64c2e", role: "UI design · Frontend", tags: ["Website", "UX", "Responsive"] },
  { slug: "jethealth", name: "JetHealth Solutions", type: "Healthcare product", year: "2026", url: "https://jethealthsolutions.lovable.app/", description: "A high-clarity product direction for a healthcare solutions platform.", accent: "#9ebcff", accent2: "#3744aa", role: "Product UI · Frontend", tags: ["Product", "SaaS", "UI systems"] },
  { slug: "prima", name: "Prima", type: "Digital product", year: "2025", url: "https://primaapp.com/", description: "A polished product experience with an approachable, modern interface language.", accent: "#f6b6df", accent2: "#8b3975", role: "UI design · Frontend", tags: ["Product", "UI", "Web"] },
  { slug: "fiatflip", name: "FiatFlip", type: "Financial product", year: "2025", url: "https://fiatflip.com/", description: "A conversion-conscious financial-product website designed for clarity and trust.", accent: "#ffd07b", accent2: "#925f12", role: "UI design · Frontend", tags: ["Fintech", "Landing page", "UI"] },
  { slug: "premier-digital", name: "Premier Digital", type: "Agency website", year: "2025", url: "https://www.premieredigital.com/", description: "A confident, service-led agency presence with a clear digital narrative.", accent: "#bec5ff", accent2: "#5156a6", role: "Web design · Frontend", tags: ["Agency", "Website", "Responsive"] },
];

export const featuredProjects = projects.slice(0, 3);
