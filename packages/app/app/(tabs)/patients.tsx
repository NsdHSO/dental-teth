import {SafeAreaView} from 'react-native-safe-area-context';
import {PatientsScreen as PatientsScreenComponent} from '@/components/PatientsScreen';

export default function PatientsPage() {
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={{flex: 1}}>
            <PatientsScreenComponent />
        </SafeAreaView>
    );
}
