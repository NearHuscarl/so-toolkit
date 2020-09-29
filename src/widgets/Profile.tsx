import React from "react";
import { Avatar } from "@material-ui/core";
import axios from "axios";
import { UserResponse, User } from "../types";

const baseUrl = "https://api.stackexchange.com/2.2/";

function Profile(props) {
  const [user, setUser] = React.useState<User>();
  React.useEffect(() => {
    axios
      .get<UserResponse>(`${baseUrl}users/9449426?site=stackoverflow`)
      .then((response) => {
        const user = response.data.items[0];
        console.log(response.data);

        if (user) {
          setUser(user);
        }
      });
  }, []);

  return (
    <div>
      <pre>{JSON.stringify(user, null, 4)}</pre>
      <Avatar />
    </div>
  );
}

export default Profile;
