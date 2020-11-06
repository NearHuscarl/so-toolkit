import React from "react"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import { Box, Tab, useTheme } from "@material-ui/core"
import { UserAutocomplete } from "app/widgets"
import { User } from "app/types"
import { useSeApi, useTry } from "app/hooks"
import { DetailBreakdownTable } from "./DetailBreakdownTable"
import { makeStyles } from "app/styles"
import { Charts } from "app/pages/PeopleReachedPage/Charts"
import { impactPageActions, useDispatch, useSelector } from "app/store"

const useStyles = makeStyles((theme) => ({
  indicator: {
    width: 3,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  tabListContainer: {
    // props.centered does not work for some reasons
    justifyContent: "center",
  },
}))

export function PeopleReachedPage() {
  const { pplReachedService } = useSeApi()
  const { $try, data, isPending } = useTry(pplReachedService.get)
  const onChangeUser = async (user: User) => {
    await $try(user.user_id)
  }
  const theme = useTheme()
  const classes = useStyles()
  const dispatch = useDispatch()
  const currentTab = useSelector((state) => state.impactPage.currentTab)
  const handleChange = (e, newValue: any) => {
    dispatch(impactPageActions.setCurrentTab(newValue))
  }

  return (
    <Box
      p={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gridRowGap={theme.spacing(4)}
    >
      <Box width={400}>
        <UserAutocomplete onChange={onChangeUser} />
      </Box>

      <Box width="95vw">
        <TabContext value={currentTab}>
          <TabList
            classes={{
              indicator: classes.indicator,
              flexContainer: classes.tabListContainer,
            }}
            variant="scrollable"
            value={currentTab}
            onChange={handleChange}
            indicatorColor="primary"
            className={classes.tabs}
          >
            <Tab value="1" label="Chart" />
            <Tab value="2" label="Detail Breakdown" />
          </TabList>

          <TabPanel value="1">
            <Charts
              loading={isPending}
              lastUpdate={data?.resultSets[1]}
              viewsByPostType={data?.resultSets[2]}
              viewsByTag={data?.resultSets[3]}
              viewsByMonth={data?.resultSets[4]}
            />
          </TabPanel>
          <TabPanel value="2">
            <DetailBreakdownTable data={data?.resultSets?.[0]} />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  )
}
