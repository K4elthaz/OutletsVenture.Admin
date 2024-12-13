import { Card } from "@mui/material";

type Props = {
  className?: string;
  children: JSX.Element | JSX.Element[];
  onClick?: () => void; 
  style?: React.CSSProperties;
};

const BlankCard = ({ children, className, onClick, ...props }: Props) => {
  return (
    <Card
      sx={{ p: 0, position: "relative", cursor: onClick ? 'pointer' : 'default' }} // Show pointer cursor if clickable
      className={className}
      elevation={9}
      onClick={onClick} // Pass the onClick event handler
      {...props}        // Spread additional props like sx, etc.
    >
      {children}
    </Card>
  );
};

export default BlankCard;
