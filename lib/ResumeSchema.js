export const resumeData = {
  basics: {
    name: "Jordan Lee",
    headline: ["Product Designer","UX","golu"],
    email: "jordan.lee@email.com",
    phone: "+1 (555) 123-4567",
    location: "Austin, TX",
    linkedin: "linkedin.com/in/jordanlee",
    portfolio: "jordanlee.design",
    summary:
      "Product designer with 6+ years of experience turning complex workflows into simple, high-converting digital products. Partner closely with product and engineering teams to ship accessible experiences that move measurable business metrics.",
  },
  experience: [
    {
      role: "Senior Product Designer",
      company: "Northstar Labs",
      location: "Austin, TX",
      startDate: "2021",
      endDate: "Present",
      bullets: [
        "Led end-to-end design for a B2B analytics platform used by 40K+ monthly users, improving activation by 28%.",
        "Built a scalable design system with 70+ accessible components, reducing feature design time by 35%.",
        "Partnered with product, research, and engineering to validate roadmap bets through weekly customer interviews.",
        "Led end-to-end design for a B2B analytics platform used by 40K+ monthly users, improving activation by 28%.",
        "Built a scalable design system with 70+ accessible components, reducing feature design time by 35%.",
        "Partnered with product, research, and engineering to validate roadmap bets through weekly customer interviews.",
        "Led end-to-end design for a B2B analytics platform used by 40K+ monthly users, improving activation by 28%.",
        "Built a scalable design system with 70+ accessible components, reducing feature design time by 35%.",
        "Partnered with product, research, and engineering to validate roadmap bets through weekly customer interviews.",
      ],
    },
    {
      role: "Senior Product Designer",
      company: "Northstar Labs",
      location: "Austin, TX",
      startDate: "2021",
      endDate: "Present",
      bullets: [
        "Led end-to-end design for a B2B analytics platform used by 40K+ monthly users, improving activation by 28%.",
        "Built a scalable design system with 70+ accessible components, reducing feature design time by 35%.",
        "Partnered with product, research, and engineering to validate roadmap bets through weekly customer interviews.",
        "Led end-to-end design for a B2B analytics platform used by 40K+ monthly users, improving activation by 28%.",
        "Built a scalable design system with 70+ accessible components, reducing feature design time by 35%.",
        "Partnered with product, research, and engineering to validate roadmap bets through weekly customer interviews.",
        "Led end-to-end design for a B2B analytics platform used by 40K+ monthly users, improving activation by 28%.",
        "Built a scalable design system with 70+ accessible components, reducing feature design time by 35%.",
        "Partnered with product, research, and engineering to validate roadmap bets through weekly customer interviews.",
      ],
    },
    {
      role: "Senior Product Designer",
      company: "Northstar Labs",
      location: "Austin, TX",
      startDate: "2021",
      endDate: "Present",
      bullets: [
        "Led end-to-end design for a B2B analytics platform used by 40K+ monthly users, improving activation by 28%.",
        "Built a scalable design system with 70+ accessible components, reducing feature design time by 35%.",
        "Partnered with product, research, and engineering to validate roadmap bets through weekly customer interviews.",
        "Built a scalable design system with 70+ accessible components, reducing feature design time by 35%.",
        "Partnered with product, research, and engineering to validate roadmap bets through weekly customer interviews.",
      ],
    },
    {
      role: "Product Designer",
      company: "Brightside Digital",
      location: "Remote",
      startDate: "2018",
      endDate: "2021",
      bullets: [
        "Designed onboarding and collaboration flows that increased trial-to-paid conversion by 19%.",
        "Created research-backed prototypes and usability tests that shortened discovery cycles by two weeks.",
        "Designed onboarding and collaboration flows that increased trial-to-paid conversion by 19%.",
        "Designed onboarding and collaboration flows that increased trial-to-paid conversion by 19%.",
        "Designed onboarding and collaboration flows that increased trial-to-paid conversion by 19%.",
      ],
    },
    {
      role: "Product Designer",
      company: "Brightside Digital",
      location: "Remote",
      startDate: "2018",
      endDate: "2021",
      bullets: [
        "Designed onboarding and collaboration flows that increased trial-to-paid conversion by 19%.",
        "Created research-backed prototypes and usability tests that shortened discovery cycles by two weeks.",
        "Designed onboarding and collaboration flows that increased trial-to-paid conversion by 19%.",
        "Created research-backed prototypes and usability tests that shortened discovery cycles by two weeks.",
      ],
    },
  ],
  education: [
    {
      degree: "BFA",
      major:" Interaction Design",
      school: "School of Visual Arts",
      location: "New York, NY",
      startDate: "2014",
      endDate: "2018",
    },

  ],
  skills:[
    { 
      category : "Technical ",
      items : ["UI/UX Design", "Interaction Design", "User Research", "Prototyping", "Wireframing", "Information Architecture"],
    },
    {
      category : "Tools",
      items : ["Figma", "Sketch", "Adobe Creative Suite", "InVision", "Miro", "Zeplin"],
    },
  ],
  certifications: ["Google UX Design Certificate", "Certified Scrum Master", "AWS Certified Solutions Architect"],
  projects: [
    {
      name: "Insight workspace",
      description: "A research synthesis tool that helped distributed teams turn feedback into product decisions.",
      bullets: [
        "Designed a research synthesis tool that helped distributed teams turn feedback into product decisions.",
        "Conducted user interviews and usability tests to validate design decisions, resulting in a 25% increase in user engagement.",
        "Collaborated with engineers to implement a responsive design system, improving cross-platform consistency.",
      ],
      link: "github.com/jordanlee/insight",
    },
    {
      name: "Insight workspace",
      description: "A research synthesis tool that helped distributed teams turn feedback into product decisions.",
      bullets: [
        "Designed a research synthesis tool that helped distributed teams turn feedback into product decisions.",
        "Conducted user interviews and usability tests to validate design decisions, resulting in a 25% increase in user engagement.",
        "Collaborated with engineers to implement a responsive design system, improving cross-platform consistency.",
      ],
      link: "github.com/jordanlee/insight",
    },
  ],
};

export const cloneResumeData = () => structuredClone(resumeData);
