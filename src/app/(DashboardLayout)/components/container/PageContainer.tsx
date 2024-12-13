import { Helmet, HelmetProvider } from 'react-helmet-async';

type Props = {
  description?: string;
  children: JSX.Element | JSX.Element[];
  title?: string;
  style?: React.CSSProperties;
  className?: string; // Add className to the Props type
};

const PageContainer = ({ title, description, children, style, className }: Props) => (
  <HelmetProvider>
    <div style={style} className={className}> {/* Apply the className prop here */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      {children}
    </div>
  </HelmetProvider>
);

export default PageContainer;
