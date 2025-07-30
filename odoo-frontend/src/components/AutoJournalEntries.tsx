import React, { useState } from 'react';
import { runAutoJournalEntries } from '../services/api';

const AutoJournalEntries: React.FC = () => {
  const [rules, setRules] = useState([{ condition: '', account: '', amount: '', partner: '' }]);
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRuleChange = (idx: number, field: string, value: string) => {
    const newRules = [...rules];
    newRules[idx][field] = value;
    setRules(newRules);
  };

  const addRule = () => setRules([...rules, { condition: '', account: '', amount: '', partner: '' }]);
  const removeRule = (idx: number) => setRules(rules.filter((_, i) => i !== idx));

  const handleRun = async () => {
    setLoading(true);
    const res = await runAutoJournalEntries(rules);
    if (res.success) setResult(res.data || []);
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">자동분개 규칙 설정</h2>
      {rules.map((rule, idx) => (
        <div key={idx} className="flex space-x-2 mb-2">
          <input value={rule.condition} onChange={e => handleRuleChange(idx, 'condition', e.target.value)} placeholder="조건" className="border px-2 py-1" />
          <input value={rule.account} onChange={e => handleRuleChange(idx, 'account', e.target.value)} placeholder="계정" className="border px-2 py-1" />
          <input value={rule.amount} onChange={e => handleRuleChange(idx, 'amount', e.target.value)} placeholder="금액" className="border px-2 py-1" />
          <input value={rule.partner} onChange={e => handleRuleChange(idx, 'partner', e.target.value)} placeholder="거래처" className="border px-2 py-1" />
          <button onClick={() => removeRule(idx)} className="text-red-500">삭제</button>
        </div>
      ))}
      <button onClick={addRule} className="mb-4 px-3 py-1 bg-gray-100 rounded">규칙 추가</button>
      <button onClick={handleRun} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
        {loading ? '실행 중...' : '자동분개 실행'}
      </button>
      <h3 className="mt-6 mb-2 font-bold">자동분개 결과</h3>
      <table className="min-w-full table-fixed border">
        <thead>
          <tr>
            <th>전표일자</th>
            <th>전표번호</th>
            <th>계정</th>
            <th>금액</th>
            <th>거래처</th>
            <th>적요</th>
          </tr>
        </thead>
        <tbody>
          {result.map((entry, idx) => (
            <tr key={idx}>
              <td>{entry.date}</td>
              <td>{entry.ref}</td>
              <td>{entry.account_name}</td>
              <td>{entry.amount}</td>
              <td>{entry.partner_name}</td>
              <td>{entry.memo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AutoJournalEntries; 