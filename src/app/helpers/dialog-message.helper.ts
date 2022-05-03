import { DotButton } from 'dotsdk';

export function hasDlgMessages(button: DotButton): boolean {
  return (
    (button.DlgMessageDictionary && Object.keys(button.DlgMessageDictionary).length > 0) ||
    (button.DlgMessage !== null && button.DlgMessage.length > 0)
  );
}
