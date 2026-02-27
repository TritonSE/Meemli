import styles from "./ProfilePicture.module.css";

type ProfilePictureProps = {
  size?: "small" | "medium" | "large";
  letter?: string;
};

export const ProfilePicture: React.FC<ProfilePictureProps> = ({ size = "small", letter }) => {
  const loggedInLetter = "?";

  const getInitials = (name: string | undefined) => {
    /* Trims the input, splits by whitespace, takes the first character of up to 
       two words, joins them, and converts to uppercase. Returns "?" if empty. */
    if (!name || !name.trim()) return loggedInLetter;

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  return (
    <div className={`${styles.profilePic} ${styles[size]}`}>
      <span>{getInitials(letter)}</span>
    </div>
  );
};
