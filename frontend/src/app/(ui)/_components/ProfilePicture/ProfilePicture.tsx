import styles from "./ProfilePicture.module.css";

// component can be small, medium, or large
// takes in a string, can be letter of first name or first name.
type ProfilePictureProps = {
  size?: "small" | "medium" | "large";
  letter?: string;
};

//TODO: conditionally render the profile picture if there is a profile picture
export const ProfilePicture: React.FC<ProfilePictureProps> = ({ size = "small", letter }) => {
  // This is a default letter for the logged in user, we can replace this with the first letter of the user's name once we have that data available in the context.
  const loggedInLetter = "JS";

  return (
    <div className={`${styles.profilePic} ${styles[size]}`}>
      <span>{letter ? letter[0] : loggedInLetter}</span>
    </div>
  );
};
