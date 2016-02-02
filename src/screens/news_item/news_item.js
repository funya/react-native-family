import React, {
  Platform,
  Text,
  View,
  Image,
  TouchableHighlight,
  ListView,
  Component,
  PropTypes
} from 'react-native';
import {connect} from 'react-redux/native';
import styles from './style';
import CardFull from '../../components/card_full';
import Loader from '../../components/loader';


import { getNewsById, getNewsRelated } from '../../module_dal/actions/news';

import {
  getNewsShowcases,
  getNewsDetailShowcase,
  loadMoreShowcase
} from '../../module_dal/actions/showcase';

class NewsItemScreen extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    this.fetchData()
  }

  /**
   * Получаем данные
   * article
   */
  fetchData() {
    let {dispatch, navigation_params} = this.props;
    const id = navigation_params.id;
    dispatch(getNewsById(id)).then(()=> {
      console.log('getNewsById');
    })
    dispatch(getNewsDetailShowcase())
    dispatch(getNewsRelated(id))
  }


  render() {
    let { news, navigator } = this.props;
    let { related, detail, loader } = news;

    if (loader || !detail.item) {
      return <Loader />
    }


    return (
      <View style={styles.container}>
        <CardFull
          {...detail.item}
          related={related}
          navigator={navigator}
          contentType='news'/>
      </View>
    );
  }
}

export default connect(state => ({
  news: state.news,
  showcases: state.showcase,
}))(NewsItemScreen);

