import React, {
  Component,
  PanResponder,
  Animated,
  Easing,
  Platform,
  Navigator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  View,
  Text,
  Image
} from 'react-native';
import {connect} from 'react-redux';

import Icon from 'react-native-vector-icons/FontAwesome';
import * as device from '_utils/device';
import IndexScreen from '_screens/index';
import ArticlesScreen from '_screens/articles';
import ArticleItemScreen from '_screens/article_item';
import NewsScreen from '_screens/news';
import NewsItemScreen from '_screens/news_item';
import SearchScreen from '_screens/search';
import Menu from '_components/menu';
import WebViewScreen from '_screens/web_view';
import {SetNavigator} from '_components/link';
import styles from './styles/base';
import Link from '_components/link';

import { NAVIGATOR_CHANGE } from '_actions/actions';

var SCREEN_WIDTH = Dimensions.get('window').width;
var BaseConfig   = Navigator.SceneConfigs.FloatFromRight;

/**
 *
 * @type {{snapVelocity: number, edgeHitWidth: *}}
 */
const CustomLeftToRightGesture = {
  ...BaseConfig.gestures.pop,
  snapVelocity: 8,
  edgeHitWidth: SCREEN_WIDTH
}

/**
 *
 * @type {{springTension: number, springFriction: number, gestures: {pop: {snapVelocity: number, edgeHitWidth: *}}}}
 */
const CustomSceneConfig = {
  ...BaseConfig,
  springTension: 100,
  springFriction: 1,
  gestures: {
    pop: CustomLeftToRightGesture
  }
}

/**
 *
 * @param route
 * @param navigator
 * @returns {*}
 */
function renderScene(route, navigator) {

  SetNavigator(navigator);

  const screenParams = {
    navigator,
    ...route
  }

  switch (route.id) {
    case 'index_screen':
      return <IndexScreen {...screenParams} />
      break;
    case 'articles':
      return <ArticlesScreen {...screenParams} />
      break;
    case 'articles_item':
      return <ArticleItemScreen {...screenParams} />
      break;
    case 'news':
      return <NewsScreen {...screenParams} />
      break;
    case 'news_item':
      return <NewsItemScreen {...screenParams} />
      break;
    case 'search':
      return <SearchScreen {...screenParams} />
      break;
    case 'web_view':
      return <WebViewScreen {...screenParams} />
      break;
    default:
      return <IndexScreen {...screenParams} />
  }
}

/**
 *
 * @returns {{LeftButton: LeftButton, Title: Title, RightButton: RightButton}}
 * @private
 */
function _navBarRouteMapper() {
  return {
    LeftButton: (route, navigator) => {
      return (route.id == 'index_screen' ? null :
          <TouchableOpacity style={styles.crumbIconPlaceholder} onPress={() => { navigator.pop(); }}>
            <Icon name="arrow-left" style={styles.crumbIcon}/>
          </TouchableOpacity>
      )
    },
    Title: (route) => {
      const {navigation_params} = route;
      return (
        <View style={styles.title}>
          <Text style={styles.title_blank}>&nbsp;</Text>
          <Text style={styles.title_item}>{navigation_params.title || 'TITLE'}</Text>
        </View>
      );
    },
    RightButton: (route) => {
      const nav = {to : "search", title: 'Поиск'};
      return (route.id  == 'search' ? null :
        <TouchableOpacity style={styles.crumbIconPlaceholder}>
          <Link {...nav} >
            <Icon name="search" style={styles.crumbIcon}/>
          </Link>
        </TouchableOpacity>
      )
    }
  }
}


/**
 *
 */
class Router extends Component {

  constructor(props) {
    super(props)

    this.state = {
      x: 0,
      translateX: new Animated.Value(0),
      opacity: 1
    }

    this.dragging    = false;
    this._isOpenMenu = false;
    this._drag       = {
      x: 0,
      y: 0,
      dragX: 115,
      dragY: 100,
      dragBack: 60
    }


    this.initialRoute = {
      title: 'App Name Test',
      type: 'tab',
      id: 'search',
      navigation_params: {
        title: 'Поиск'
      }
    }

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: this._onStartShouldSetResponder.bind(this),
      onMoveShouldSetPanResponder: this._onResponderMove.bind(this),
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false
    });
  }

  componentWillMount() {

  }

  /**
   * отслеживаем swipe событие
   * сдвигаем главную View и показываем меню
   *
   * Условия по которым происходит анимация смещения View
   *   если swipe по X больше чем 115
   *   если меню еще не открыто
   *   если смещение по Y не больше 100
   *
   *
   * Если смещение по Y больше 100, то прячем меню
   *
   * @param evt
   * @param gestureState
   * @returns {boolean}
   * @private
   */
  _onResponderMove(evt, gestureState) {
    evt                   = evt.nativeEvent;
    const {x, y, dragX, dragY, dragBack} = this._drag;
    const positionX       = Math.round(this.state.x + (evt.pageX - x));
    const prevPositionX   = Math.round(x);
    const revertPositionX = prevPositionX - (prevPositionX + positionX);
    const isOpen          = this._isOpenMenu;

    function move() {
      if (Math.abs(evt.pageY - y) > dragY && isOpen) {
        this.resetPosition()
      }

      if (positionX > dragX && revertPositionX < 0 && !isOpen && Math.abs(evt.pageY - y) < dragY) {
        this._isOpenMenu = true;
        Animated.spring(
          this.state.translateX,
          {
            toValue: 150,
            duration: 300,
            easing: Easing.elastic(2)
          }
        ).start();
        this._drag.x = evt.pageX;
      } else if (revertPositionX >= dragBack && isOpen) {
        this.resetPosition()
      }
    }

    setTimeout(move.bind(this), 66);
    return false;
  }

  resetPosition(evt) {
    this.dragging    = false;
    this._isOpenMenu = false;
    Animated.spring(
      this.state.translateX,
      {toValue: 0, duration: 300}
    ).start();
  }

  _onStartShouldSetResponder(evt) {
    this.dragging = true;
    this._drag    = {
      ...this._drag,
      x: evt.nativeEvent.pageX,
      y: evt.nativeEvent.pageY
    }
    return false;
  }

  getStyle() {
    return {
      transform: [{
        translateX: this.state.translateX
      }]
    };
  }


  /**
   * Событие Navigator, после того как отрисуется view
   * создаем событие NAVIGATOR_CHANGE для меню
   *
   * @param route
   * @private
   */
  _onWillFocus(route) {
    const { dispatch } = this.props;
    let routeId = route.id;

    if (route.id) {
      if (route.id.indexOf('articles') != -1) {
        routeId = 'articles';
      } else if (route.id.indexOf('news') != -1) {
        routeId = 'news';
      }
    }

    route = {
      ...route,
      routeId
    }

    dispatch({type: NAVIGATOR_CHANGE, data: route})

    if (this._isOpenMenu) {
      this.resetPosition();
    }
  }

  render() {
    return (
      <View style={styles.root_view}
        {...this._panResponder.panHandlers}>

        <Menu />

        <Animated.View style={[styles.root_view_wrapper, this.getStyle()]}>
          <Navigator
            ref="nav"
            initialRoute={this.initialRoute}
            onDidFocus={(route)=>{}}
            onWillFocus={this._onWillFocus.bind(this)}
            renderScene={renderScene}
            configureScene={(route, routeStack)=>CustomSceneConfig}
            navigationBar={<Navigator.NavigationBar routeMapper={_navBarRouteMapper()} />}
            style={styles.navigator}/>
        </Animated.View>
      </View>
    )
  }
}

export default connect()(Router);



