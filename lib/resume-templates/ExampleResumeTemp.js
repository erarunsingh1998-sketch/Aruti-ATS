"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, Link, Globe, ExternalLink } from "lucide-react";

const PAGE_HEIGHT_PX = 1056; // 11in at 96 DPI
const PAGE_PADDING_TOP_BOTTOM = 64; // 32px top + 32px bottom
const FOOTER_HEIGHT_PX = 40; 
const MAX_CONTENT_HEIGHT = PAGE_HEIGHT_PX - PAGE_PADDING_TOP_BOTTOM - FOOTER_HEIGHT_PX; // ~952px

const formatUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

export default function ExampleResumeTemp({ resumeData }) {
  
  if(!resumeData) return <></>;

  const containerRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [isMeasured, setIsMeasured] = useState(false);

  // Deconstruct full resume object into flat atomic layout blocks
  const blocks = buildAtomicBlocks(resumeData);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const children = Array.from(containerRef.current.children);
    const pageBuckets = [[]];
    let currentPageIndex = 0;
    let currentHeight = 0;

    children.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const elHeight = el.offsetHeight + marginTop + marginBottom;

      // If adding this atomic element exceeds max content height, push to next page bucket
      if (currentHeight + elHeight > MAX_CONTENT_HEIGHT-50 && pageBuckets[currentPageIndex].length > 0) {
        currentPageIndex++;
        pageBuckets[currentPageIndex] = [];
        currentHeight = 0;
      }

      pageBuckets[currentPageIndex].push(blocks[index]);
      currentHeight += elHeight;
    });

    setPages(pageBuckets);
    setIsMeasured(true);
  }, [resumeData]);

  // Phase 1: Invisible measurement stage
  if (!isMeasured) {
    return (
      <div
        ref={containerRef}
        className="w-[816px] p-8 opacity-0 pointer-events-none absolute -left-[9999px] -top-[9999px] bg-white text-gray-900 font-sans"
      >
        {blocks.map((block) => (
          <div key={block.id}>{block.node}</div>
        ))}
      </div>
    );
  }

  // Phase 2: Page Render Engine
  return (
    <div className="flex flex-col items-center gap-8 py-8 min-h-screen print:bg-transparent print:p-0">
      {pages.map((pageBlocks, pageIndex) => (
        <div
          key={pageIndex}
          className="relative w-[816px] h-[1056px] min-h-[1056px] max-h-[1056px] p-8 bg-white shadow-lg text-gray-900 font-sans flex flex-col justify-between overflow-hidden box-border print:shadow-none print:m-0 print:break-after-page"
        >
          {/* Main Printable Content Container */}
          <div className="w-full flex-1 overflow-hidden space-y-1">
            {pageBlocks.map((block) => (
              <React.Fragment key={block.id}>{block.node}</React.Fragment>
            ))}
          </div>

          {/* Letter Page Footer pinned at bottom */}
          <div className="h-[40px] pt-2 border-t border-gray-200 text-xs text-gray-400 flex justify-between items-end flex-shrink-0 select-none print:hidden">
            <span>{resumeData.basics?.name} — Resume</span>
            <span>
              Page {pageIndex + 1} of {pages.length}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   ATOMIC BUILDER ENGINE (Flattens multi-line structures for exact slicing)
   ============================================================================ */

function buildAtomicBlocks(data) {
  const blocks = [];

  // Header Block
  blocks.push({
    id: "header",
    node: <HeaderBlock data={data.basics} />,
  });

  // Summary Block
  if (data.basics?.summary) {
    blocks.push({
      id: "summary",
      node: <SummaryBlock summary={data.basics.summary} />,
    });
  }

  // Experience Section
  if (data.experience?.length > 0) {
    blocks.push({
      id: "heading-experience",
      node:(<>
        <SectionHeading title="Work Experience"  />
        <ExperienceSubSection items={data.experience[0]} />
      </> ),
    });

    data.experience.slice(1).forEach((exp, expIdx) => {
      // Sub-heading for Experience entry (Company, Role, Dates)
      blocks.push({
        id: `exp-header-${expIdx}`,
        node: (
          <ExperienceSubSection items={exp} />
        ),
      });
    });
  }

  // Key Projects Section
  if (data.projects?.length > 0) {
    blocks.push({
      id: "heading-projects",
      node: <>
        <SectionHeading title="Key Projects" />
        <ProjectSubSection item={data.projects[0]} />
      </>
    });

    data.projects.slice(1).forEach((proj, projIdx) => {
      blocks.push({
        id: `proj-header-${projIdx}`,
        node: (
          <ProjectSubSection item={proj} />
        ),
      });
    });
  }

  // Education Section
  if (data.education?.length > 0) {
    blocks.push({
      id: "heading-education",
      node:<>
        <SectionHeading title="Education" />
        <EducationSubSection item={data?.education[0]}/>
      </>,
    });
    data.education.slice(1).forEach((edu, idx)=> {
      blocks.push({
        id: `education-${idx}`,
        node: <EducationSubSection item={edu} />
      })
    })
  }

  // Skills Section
  if (Object.keys(data.skills || {}).length > 0) {
    blocks.push({
      id: "heading-skills",
      node: <>
        <SectionHeading title="Skills" />
        <SkillSubSection objKey={Object.keys(data.skills)[0]} objValue={data.skills[Object.keys(data.skills)[0]]} />
      </>,
    });
    Object.keys(data.skills).slice(1).forEach((skill, idx)=> {
      blocks.push({
        id: `skill-${idx}`,
        node: <SkillSubSection objKey={skill} objValue={data.skills[skill]} />
      })
    })
  }
  // Skills Section if skills is array of objects with category and items
  if (data.skills?.length > 0) {
    blocks.push({
      id: "heading-skills",
      node: <>
        <SectionHeading title="Skills" />
        <SkillSubSection objKey={data.skills[0].category} objValue={data.skills[0].items} />
      </>,
    });
    data.skills.slice(1).forEach((skillGroup, idx)=> {
      blocks.push({
        id: `skill-${idx}`,
        node: <SkillSubSection objKey={skillGroup.category} objValue={skillGroup.items} />
      })
    })
  }


  // Certifications Section
  if (data.certifications?.length > 0) {
    blocks.push({
      id: "heading-certifications",
      node: <>
        <SectionHeading title="Certifications" />
        <CertificateSubSection item={data.certifications[0]} />
      </>,
    });
    data.certifications.slice(1).forEach((cert, idx)=> {
      blocks.push({
        id: `certification-${idx}`,
        node: <CertificateSubSection item={cert} />
      })
    });
  }

  return blocks;
}

/* ============================================================================
   PRESENTATION ATOMS
   ============================================================================ */

function HeaderBlock({ data }) {
  const headlineItems = Array.isArray(data.headline) ? data.headline : typeof data.headline === "string" ? data.headline.split(",").map((s) => s.trim()) : [data.headline];

  return (
    <div className="pb-1">
      <h1 className="text-3xl text-center font-bold uppercase tracking-wider text-gray-900">{data.name}</h1>
      <p className="text-sm text-center font-medium text-sky-700 mt-1 flex justify-center flex-wrap items-center gap-1">
        {headlineItems.map((pos, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <span>{pos}</span>
            {idx < headlineItems.length - 1 && <span className="text-amber-600 font-bold">|</span>}
          </span>
        ))}
      </p>
      <hr className="mt-2 border-sky-700/30" />
      <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-800 border-b border-sky-700/40  py-1">
        {data.email && (
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-sky-700" /> {data.email}
          </span>
        )}
        {data.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-sky-700" /> {data.phone}
          </span>
        )}
        {data.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-700" /> {data.location}
          </span>
        )}
        {data.linkedin && (
          <a href={formatUrl(data.linkedin)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
            <Link className="w-3 h-3 text-sky-700" /> {data.linkedin.toString().split("/in/")[1]}
          </a>
        )}
        {data.portfolio && (
          <a href={formatUrl(data.portfolio)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
            <Globe className="w-3 h-3 text-sky-700" /> {data.portfolio}
          </a>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="mt-3 mb-0.5">
      <h2 className="text-lg font-bold uppercase tracking-wider text-sky-800 border-b border-sky-700/40">
        {title}
      </h2>
    </div>
  );
}

function SummaryBlock({ summary }) {
  return (
    <div className="mt-1">
      <h2 className="text-lg font-bold uppercase pb-0 tracking-wider text-sky-800 border-b border-sky-700/40 mb-0.5">
        Professional Summary
      </h2>
      <p className="text-[0.85em] text-slate-800 font-serif leading-relaxed">{summary}</p>
    </div>
  );
}

function ExperienceSubSection({items}){

  return (
    <div className="mt-0 mb-1">
      <div className="flex justify-between items-baseline">
        <h3 className="text-md font-semibold text-sky-700">
          {items.role} <span className="text-amber-600">| </span>
          <span className="font-normal text-sky-900">{items.company}</span>
        </h3>
        <span className="text-sm text-slate-700 font-semibold">
          {items.startDate} – {items.endDate} {items.location ? `• ${items.location}` : ""}
        </span>
      </div>
      {Array.from(items?.bullets || []).map((bullet, bulletIdx) => (
        <ul key={bulletIdx} className="list-disc mb-0 list-outside ml-4 text-[0.85em] font-serif text-slate-800">
          <li>{bullet}</li>
        </ul>
      ))}
    </div>
  );
}

const ProjectSubSection = ({ item }) => {

  return (
    <div className="mb-1 ">
      <div className="flex justify-between items-baseline mb-0 pb-0">
        <h3 className="text-md font-semibold text-sky-700">
          {item.name}
          {item.client && <>
            <span className="text-amber-600"> | </span> 
            <span className="font-normal text-sky-900">{item.client}</span>
          </>}
        </h3>
        {item.link && (
          <a href={formatUrl(item.link)} target="new" className="text-sm text-slate-700 font-semibold">
            <ExternalLink className="w-3 h-3 inline" /> {item.link.split("com/")[1]}
          </a>
        )}
      </div>
      {item?.technologies && <p className="text-sm text-gray-600 mt-0.5">
        {item.technologies.map((tech, idx) => <span key={idx} className="bg-gray-100 px-2 py-0.5">
          {tech}
        </span>)}
      </p>}
      {item?.description && <p className="text-sm font-ubuntu text-gray-700">{item.description}</p>}
      {Array.from(item?.bullets || []).map((bullet, bulletIdx) => (
        <ul key={bulletIdx} className="list-disc list-outside ml-4 text-[0.85em] font-serif space-y-0 text-gray-700">
          <li>{bullet}</li>
        </ul>
      ))}
    </div>
  );
}

const EducationSubSection = ({ item }) => {

  return (
    <div className="flex justify-between items-baseline mb-1">
      <div>
        <h3 className="text-md font-semibold text-sky-700">
          {item.degree}
          {item.major && <>
            <span className="text-amber-600"> | </span> 
            <span className="font-normal text-sky-900">{item.major}</span>
          </>}
        </h3>
        <p className="text-sm font-serif  text-gray-800">
          {item.school} {item.location ? `, ${item.location}` : ""}
        </p>
      </div>
      <span className="text-sm text-slate-700 font-semibold">
        {item.startDate} – {item.endDate}
      </span>
    </div>
  );
}

const SkillSubSection =({objKey, objValue})=>{
  return (<p className="flex gap-2  mb-0 p-0">
    <span className="font-semibold text-sky-700">
      {objKey.charAt(0).toUpperCase() + objKey.slice(1)}:
    </span>
    <span className="pt-1 text-sm text-gray-800 font-serif">{objValue.join(", ")}</span>
  </p>)
}

function CertificateSubSection({ item }) {

 return (<ul className="list-disc list-inside text-sm font-serif mb-0 text-gray-700 space-y-0.5">
    <li>{item}</li>
  </ul>)
}