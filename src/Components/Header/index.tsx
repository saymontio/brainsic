import format from 'date-fns/format';
import ptBr from 'date-fns/locale/pt-BR';

import styles from './styles.module.scss';

export function Header() {
    const currentDate = format(new Date, 'EEEEEE, d MMMM', {
        locale: ptBr,
    });
    return (
        <header className={styles.headerContainer}>
            <img src="/logo.png" alt="Brainsic" />
            <p>A musica que não sai da cabeça!</p>

            <span>{currentDate}</span>
        </header>
    );
}