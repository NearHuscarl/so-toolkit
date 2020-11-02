import React from "react"
import { Controller, useForm, UseFormMethods } from "react-hook-form"
import { Redirect, useHistory } from "react-router-dom"
import {
  Box,
  Button,
  StepLabel,
  Stepper,
  Step,
  Typography,
  TextField,
  Link as MuiLink,
} from "@material-ui/core"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import chromeImg from "app/images/Chrome.png"
import firefoxImg from "app/images/Firefox.png"
import { useAuth, useTry } from "app/hooks"
import { AuthResult } from "app/store/auth.duck"
import { getBrowser } from "app/helpers"

const schema = yup.object().shape({
  authCookie: yup
    .string()
    .required()
    .matches(/^[0-9A-F]+$/, "Must contain only digits and characters A-F")
    .min(192, "Must be exactly 192 characters")
    .max(192, "Must be exactly 192 characters"),
})

type StepProps = {
  activeStep: number
  nextStep: () => void
} & UseFormMethods<AuthResult>

function Step1(props: StepProps) {
  const { activeStep, nextStep, setValue, register, control } = props
  const { authorize } = useAuth()
  const display = activeStep === 0
  const { $try: tryAuthorize, isPending } = useTry(authorize)
  const onAuthorize = async () => {
    const res = await tryAuthorize()

    if (res) {
      setValue("accessToken", res.accessToken)
      setValue("user", res.user)
      nextStep()
    }
  }

  return (
    <Box display={display ? "block" : "none"}>
      <Button color="primary" disabled={isPending} onClick={onAuthorize}>
        Authorize
      </Button>
      <input type="hidden" ref={register} name="accessToken" />
      <Controller name="user" control={control} render={() => <div />} />
    </Box>
  )
}

function Link({ children }) {
  return (
    <MuiLink href={children} target="_blank" rel="noopener noreferrer">
      {children}
    </MuiLink>
  )
}

function GetAuthCookieInstructions() {
  const browser = getBrowser()

  return (
    <>
      <ol>
        <li>
          Go to <Link>https://data.stackexchange.com</Link> and login
        </li>
        <li>
          Hit <kbd>F12</kbd> to open the console and copy the value of{" "}
          <code>.ASPXAUTH</code> cookie
        </li>
      </ol>
      <img
        src={browser === "firefox" ? firefoxImg : chromeImg}
        alt="auth cookie"
      />
    </>
  )
}

function Step2(props: StepProps) {
  const { activeStep, control, errors, handleSubmit } = props
  const display = activeStep === 1
  const history = useHistory()
  const { login } = useAuth()

  return (
    <Box
      display={display ? "flex" : "none"}
      flexDirection="column"
      alignItems="center"
      gridRowGap={15}
    >
      <GetAuthCookieInstructions />
      <Box
        display={display ? "flex" : "none"}
        flexDirection="column"
        gridRowGap={15}
        width={400}
      >
        <Controller
          name="authCookie"
          control={control}
          as={
            <TextField
              label="Auth Cookie"
              multiline
              error={!!errors.authCookie}
              helperText={errors.authCookie && errors.authCookie.message}
            />
          }
        />
        <Button
          color="primary"
          type="submit"
          onClick={handleSubmit(async (data) => {
            login(data)
            history.push("/")
          })}
        >
          Submit
        </Button>
      </Box>
    </Box>
  )
}

function getSteps() {
  return ["Get the access token", "Get the auth cookie"]
}

export function LoginPage() {
  const [activeStep, setActiveStep] = React.useState(0)
  const form = useForm<AuthResult>({
    resolver: yupResolver(schema),
  })

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  return (
    <Box
      p={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gridRowGap={15}
    >
      <Typography variant="subtitle2">
        Please follow the below steps to authorize
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {getSteps().map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Step1 activeStep={activeStep} nextStep={handleNext} {...form} />
      <Step2 activeStep={activeStep} nextStep={handleNext} {...form} />
    </Box>
  )
}

const schemaOld = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LoginPageOld() {
  const { authorize } = useAuth()
  const { $try, data, error, isPending } = useTry(authorize, {
    errorSnackbar: false,
  })
  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schemaOld),
  })
  const onSubmit = async (formData) => {
    // await $try(() => authorize(formData))
  }

  if (data) {
    return <Redirect to="/" />
  }

  return (
    <Box
      p={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gridRowGap={15}
    >
      <Typography variant="h4">Login</Typography>
      <Typography variant="subtitle2">
        Enter your Stack Overflow email and password to login
      </Typography>
      <Controller
        name="email"
        control={control}
        as={
          <TextField
            type="email"
            label="Email"
            error={!!errors.email}
            helperText={errors.email && errors.email.message}
          />
        }
      />
      <Controller
        name="password"
        control={control}
        as={
          <TextField
            type="password"
            label="Password"
            error={!!errors.password}
            helperText={errors.password && errors.password.message}
          />
        }
      />
      {error && <div>{error.message}</div>}
      <Button
        color="primary"
        disabled={isPending}
        type="submit"
        onClick={handleSubmit(onSubmit)}
      >
        Login
      </Button>
    </Box>
  )
}
