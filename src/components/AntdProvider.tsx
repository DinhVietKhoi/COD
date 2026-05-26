import type { ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useTranslation } from 'react-i18next';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import { useTheme } from '../contexts/ThemeContext';

export default function AntdProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const code = (i18n.language ?? 'vi').toLowerCase();
  const locale = code.startsWith('vi')
    ? viVN
    : code.startsWith('kr') || code.startsWith('ko')
      ? koKR
      : enUS;
  const isDark = theme === 'dark';

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: '#6366f1' },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
