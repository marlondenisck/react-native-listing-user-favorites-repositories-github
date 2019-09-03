import React, { Component } from 'react';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    stars: [],
    loading: true,
    page: 1,
  };

  async componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(_, prevState) {
    const { page } = this.state;
    if (prevState.page !== page) {
      this.loadData();
    }
  }

  loadData = async () => {
    try {
      const { navigation } = this.props;
      const { stars, page } = this.state;
      const user = navigation.getParam('user');

      const response = await api.get(`/users/${user.login}/starred`, {
        params: { page },
      });

      this.setState({
        stars: page >= 2 ? [...stars, ...response.data] : response.data,
        page,
        loading: false,
      });
    } catch (err) {}
  };

  loadMore = () => {
    const { page } = this.state;
    const nextPage = page + 1;
    this.setState({ page: nextPage });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading } = this.state;
    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <Loading />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% d
            onEndReached={this.loadMore} // Função que carrega mais itens
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
