import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';

import App from './src/App';
import { trackBackgroundNotificationEvents } from './src/utils/notifications';

trackBackgroundNotificationEvents();

AppRegistry.registerComponent('futurelearnmobile', () => App);
