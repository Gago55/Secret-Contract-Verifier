import React from 'react'
import { Box, Container, createMuiTheme, Paper, ThemeProvider, Typography } from '@material-ui/core';
import Header from './components/Header';
import DetailedView from './components/DetailedView';
import Codes from './components/Codes';
import { Route, RouteComponentProps } from 'react-router';
import { SnackbarProvider } from 'notistack'

interface MatchParams {
  address?: string;
}

interface MatchProps extends RouteComponentProps<MatchParams> {
}

const App = () => {

  return (
    <SnackbarProvider>
      <div className="App">
        <Header />
        <Container>
          <Box m={3} style={{}}>
            <Route exact path="/" render={() => <Codes />} />
            <Route path="/:address?" render={({ match }: MatchProps) => <DetailedView address={match.params.address} />} />
          </Box>
        </Container>
      </div>
    </SnackbarProvider>
  )
}

export default App;
