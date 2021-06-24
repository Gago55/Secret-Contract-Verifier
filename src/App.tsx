import React from 'react'
import { Box, Container, createMuiTheme, Paper, ThemeProvider, Typography } from '@material-ui/core';
import Header from './components/Header';
import DetailedView from './components/DetailedView';
import Codes from './components/Codes';
import { Route, RouteComponentProps } from 'react-router';
import { SnackbarProvider } from 'notistack'
import VerifyAttempt from './components/VerifyAttempt';

interface MatchParamsDetailedView { address?: string; }
interface MatchPropsDetailedView extends RouteComponentProps<MatchParamsDetailedView> { }

interface MatchParamsVerifyAttempt { id?: string; }
interface MatchPropsVerifyAttempt extends RouteComponentProps<MatchParamsVerifyAttempt> { }

const App = () => {

  return (
    <SnackbarProvider>
      <div className="App">
        <Header />
        <Container>
          <Box m={3} style={{}}>
            <Route exact path="/" render={() => <Codes />} />
            <Route path="/contracts/:address?" render={({ match }: MatchPropsDetailedView) => <DetailedView address={match.params.address} />} />
            <Route path="/verifyattempts/:id?" render={({ match }: MatchPropsVerifyAttempt) => <VerifyAttempt attemptId={match.params.id} />} />
          </Box>
        </Container>
      </div>
    </SnackbarProvider>
  )
}

export default App;
