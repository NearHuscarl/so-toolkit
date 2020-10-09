import { makeStyles as muiMakeStyles } from "@material-ui/styles";
import {
  ClassNameMap,
  Styles,
  WithStylesOptions,
} from "@material-ui/styles/withStyles";
import { Omit } from "@material-ui/types";
import { MyTheme } from "app/providers";

// material-ui makeStyles with typed Theme
export default function makeStyles<
  Theme = MyTheme,
  ClassKey extends string = string
>(
  style: Styles<Theme, {}, ClassKey>,
  options?: Omit<WithStylesOptions<Theme>, "withTheme">
): (props?: any) => ClassNameMap<ClassKey> {
  return muiMakeStyles(style, options);
}
