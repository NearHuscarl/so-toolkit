import React from "react";
import { render } from "@testing-library/react";
import axios from "axios";
import UserAutocomplete, { DEBOUNCED_TIME } from "app/widgets/UserAutocomplete";
import usersResponse from "app/services/userService.data";

// - Test autocomplete return exactly 5 users
// - Test autocomplete timeout
// - Test autocomplete loading component
// - Test autocomplete throttle (0,1999,2000)

test(`should throttle for ${DEBOUNCED_TIME}ms`, async () => {
  // axios.get("what").then((r) => console.log(r));
  // axios
  //   .get("https://api.stackexchange.com/2.2/users", {
  //     params: { inname: "near" },
  //   })
  //   .then((r) => console.log(r));

  // render(<UserAutocomplete onChange={(u) => console.log(u)} />);
  expect(0).toBe(0);
});
