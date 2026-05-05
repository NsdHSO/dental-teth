import {SafeAreaView} from 'react-native-safe-area-context';
import {DentistsScreen as DentistsScreenComponent} from '@/components/DentistsScreen';

export default function DentistsPage() {
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={{flex: 1}}>
            <DentistsScreenComponent />
        </SafeAreaView>
    );
}
