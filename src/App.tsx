import React from 'react'
import { Box, Container, createMuiTheme, Paper, ThemeProvider, Typography } from '@material-ui/core';
import Header from './components/Header';
import Contract from './components/Contract';
import Codes from './components/Codes';
import { Route, RouteComponentProps } from 'react-router';

interface MatchParams {
  address?: string;
}

interface MatchProps extends RouteComponentProps<MatchParams> {
}

const App = () => {

  return (
    <div className="App">
      <Header />
      <Container>
        <Box m={3} style={{}}>
          <Route exact path="/" render={() => <Codes />} />
          <Route path="/:address?" render={({ match }: MatchProps) => <Contract address={match.params.address} />} />
        </Box>
      </Container>
    </div>
  )
}

export default App;
