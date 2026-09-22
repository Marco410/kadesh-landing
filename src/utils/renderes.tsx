import { DocumentRendererProps } from "@keystone-6/document-renderer";
import { JSX } from "react";

const renderers: DocumentRendererProps['renderers'] = {
  inline: {
    bold: ({ children }) => {
      return <strong>{children}</strong>;
    },
  },
  block: {
    paragraph: ({ children, textAlign }) => {
      return (
        <p
          className="mb-4 leading-relaxed text-[#424242] dark:text-[#e0e0e0]"
          style={{ textAlign }}
        >
          {children}
        </p>
      );
    },
    heading: ({ children, textAlign, level }) => {
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      const headingClasses = {
        1: 'text-4xl font-bold mb-6 mt-10 first:mt-0',
        2: 'text-3xl font-bold mb-5 mt-9 first:mt-0',
        3: 'text-2xl font-bold mb-4 mt-8 first:mt-0',
        4: 'text-xl font-bold mb-3 mt-6 first:mt-0',
        5: 'text-lg font-bold mb-3 mt-5 first:mt-0',
        6: 'text-base font-bold mb-2 mt-4 first:mt-0',
      }[level] || 'text-lg font-bold mb-3';
      return (
        <HeadingTag
          className={`${headingClasses} text-[#212121] dark:text-[#ffffff]`}
          style={{ textAlign }}
        >
          {children}
        </HeadingTag>
      );
    },
    list: ({ children, type }) => {
      const itemClass = 'text-[#424242] dark:text-[#e0e0e0]';
      return type === 'unordered' ? (
        <ul className="mb-4 list-disc space-y-2 pl-5">
          {children.map((child, index) => (
            <li key={index} className={itemClass}>{child}</li>
          ))}
        </ul>
      ) : (
        <ol className="mb-4 list-decimal space-y-2 pl-5">
          {children.map((child, index) => (
            <li key={index} className={itemClass}>{child}</li>
          ))}
        </ol>
      );
    },
    divider: () => {
      return <hr className="my-8 border-[#e0e0e0] dark:border-[#3a3a3a]" />;
    },
  },
};

export default renderers;