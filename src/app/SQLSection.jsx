'use client';
import * as React from 'react';
import clsx from 'clsx';

export default function SQLSection() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState(null);
  const [error, setError] = React.useState(null);

  const retriveData = async () => {
    try {
      const response = await fetch('/api/hello');
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const handleClick = async () => {
    setResults(null);
    setError(null);
    setIsLoading(true);
    const { data, error } = await retriveData();
    console.log(data);
    console.error(error);
    if (error) {
      setError(error);
    } else {
      setResults(data);
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className='h-full w-full relative bg-white px-6 py-6 shadow-xl ring-1 ring-gray-900/5 rounded-lg mt-4 text-left'>
        <button
          className='btn btn-sm mb-4'
          disabled={isLoading}
          onClick={handleClick}
        >
          {isLoading && <span className='loading loading-spinner'></span>}
          {!isLoading && (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z'
              />
            </svg>
          )}
          Run SQL
        </button>

        <div className='mockup-code'>
          <pre data-prefix='>'>
            <code>{`SELECT "Hello World";`}</code>
          </pre>
          {(results || error) && <pre data-prefix=''> </pre>}
          {results && stringifyIntoLines(results, 'error')}
          {error && stringifyIntoLines(error, 'error')}
        </div>
      </div>
    </>
  );
}

function stringifyIntoLines(obj, type = 'default') {
  return JSON.stringify(obj, null, 2)
    .split('\n')
    .map((line, index) => {
      return (
        <pre
          key={index}
          data-prefix={index === 0 ? '>' : ''}
          className={clsx({
            'text-success': type === 'success',
            ['bg-warning text-warning-content']: type === 'error',
          })}
        >
          <code>{line}</code>
        </pre>
      );
    });
}
